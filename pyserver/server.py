from flask import Flask, request, jsonify
import logging
import traceback
from flask_cors import CORS
from werkzeug.utils import secure_filename
import psycopg2
import os
import re
import sys
import requests
import time
import datetime
from PIL import Image


app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Örneğin 16 MB olarak ayarlayın
app.config['UPLOAD_FOLDER'] = '/upload'
UPLOAD_PATH = app.config['UPLOAD_FOLDER']
IMAGES_PATH = os.path.join(UPLOAD_PATH,'/images')
THUMBNAILS_PATH = os.path.join(UPLOAD_PATH,'/thumbnails')

logging.basicConfig(level=logging.INFO)
CORS(app, resources={r"/api/*": {"origins": ["https://quiri.shop", "http://localhost:3000"]}})


if len(sys.argv) > 1 and sys.argv[1] == 'dev':
    db_host = 'localhost'
else:
    db_host = 'quiri.shop'

db_password = os.environ.get('DATABASE_PASSWORD')
if db_password == None:
    db_password = 'tGTCX!(<lZOnCWm'
    
db_conn = psycopg2.connect(
            user='postgres',
            host=db_host,
            database='quiri',
            password=db_password,
            port=5432
    )
@app.before_request
def log_request_info():
    app.logger.info('Headers: %s', request.headers)
    app.logger.info('Body: %s', request.get_data())
    ensure_db_connection()

def ensure_db_connection():
    global db_conn
    global db_password
    global db_host
    try:
        db_conn.cursor()
    except (psycopg2.InterfaceError, psycopg2.OperationalError):
        db_conn = psycopg2.connect(
            user='postgres',
            host=db_host,
            database='quiri',
            password=db_password,
            port=5432
        )
        print("Connecting to ",db_host)

def create_upload_folder_if_not_exists(folder_path):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
        print(f"Created directory: {folder_path}")
    else:
        print(f"Directory already exists: {folder_path}")

def create_thumbnail(image_path, thumbnail_path, size=(128, 128)):
    with Image.open(image_path) as img:
        img.thumbnail(size)
        img.save(thumbnail_path)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    folder_path = IMAGES_PATH
    if 'file' not in request.files:
        return jsonify(error='No file part'), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify(error='No selected file'), 400
    if file:
        # Zaman damgası ile dosya adını benzersiz hale getir
        filename = secure_filename(f"{int(time.time())}_{file.filename}")
        file_path = os.path.join(folder_path, filename)
        file.save(file_path)
        thumbnail_folder = THUMBNAILS_PATH
        thumbnail_filename = os.path.basename(filename)
        thumbnail_path = os.path.join(thumbnail_folder, thumbnail_filename)
        create_thumbnail(file_path, thumbnail_path)

        return jsonify({"imageurl":file_path,"thumbnailurl":thumbnail_path}), 201
    
# Get App Settings
@app.route('/api/appsettings', methods=['GET'])
def get_appsettings():
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT settingkey,settingvalue FROM appsettings")
            appsettings = []
            for settingkey,settingvalue in cursor.fetchall():
                appsettings.append({"settingkey":settingkey,"settingvalue":settingvalue})
            return jsonify(appsettings=appsettings), 200
    except Exception as e:
        return jsonify(error=str(e)), 500



@app.route('/api/appsettings-for-use', methods=['GET'])
def get_appsettings_for_use():
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT * FROM appsettings")
            appsettings = {row[1]: row[2] for row in cursor.fetchall()}
            return jsonify(appsettings=appsettings), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

# Add App Setting
@app.route('/api/appsettings', methods=['POST'])
def add_appsetting():
    try:
        data = request.get_json()
        with db_conn.cursor() as cursor:
            cursor.execute("INSERT INTO appsettings (settingkey, settingvalue) VALUES (%s, %s);", (data['settingkey'], data['settingvalue']))
            db_conn.commit()
            return jsonify(success=True), 201
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

# Update App Setting
@app.route('/api/appsettings/<settingkey>', methods=['PUT'])
def update_appsetting(settingkey):
    try:
        data = request.get_json()
        with db_conn.cursor() as cursor:
            cursor.execute("UPDATE appsettings SET settingvalue = %s WHERE settingkey = %s;", (data['settingvalue'], settingkey))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

# Delete App Setting
@app.route('/api/appsettings/<settingkey>', methods=['DELETE'])
def delete_appsetting(settingkey):
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("DELETE FROM appsettings WHERE settingkey = %s;", (settingkey,))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500



def create_product(row, cursor):
    productid, barcode, name, price, discountpercentage, newyn, shortdescription, fulldescription, instagramurl, youtubeurl, twitterurl, facebookurl, linkedinurl = row
    return {
            'id': productid,
            'barcode': barcode,
            'name': name,
            'price': price,
            'discountpercentage': discountpercentage,
            'newyn': newyn,
            'shortdescription': shortdescription,
            'fulldescription': fulldescription,
            'instagramurl': instagramurl,
            'youtubeurl': youtubeurl,
            'twitterurl': twitterurl,
            'facebookurl': facebookurl,
            'linkedinurl': linkedinurl,
            'images': fetch_images(cursor, productid),
            'variations': fetch_variations(cursor, productid),
            'categories': fetch_categories(cursor, productid),
            'tags': fetch_tags(cursor, productid)
        }

@app.route('/api/products/<int:productid>', methods=['PUT'])
def updateProduct(productid):
    try:
        with db_conn.cursor() as cursor:
            data = request.get_json()
            print(data)
            # Ürün bilgilerini güncelle
            cursor.execute("""
                UPDATE products
                SET barcode = %s, name = %s, price = %s, discountpercentage = %s, newyn = %s, shortdescription = %s, fulldescription = %s, instagramurl = %s, youtubeurl = %s, twitterurl = %s, facebookurl = %s, linkedinurl = %s
                WHERE id = %s;
            """, (
                data.get('barcode', ''), data.get('name', ''), data.get('price', 0), data.get('discountpercentage', 0), 
                data.get('newyn', False),  data.get('shortdescription', ''), 
                data.get('fulldescription', ''), data.get('instagramurl', ''), data.get('youtubeurl', ''), data.get('twitterurl', ''), 
                data.get('facebookurl', ''), data.get('linkedinurl', ''),
                productid
            ))

            # Kategorileri güncelle
            if 'categories' in data:
                # Önceki kategorileri sil (veya güncelleme stratejinize göre ayarlayın)
                cursor.execute("DELETE FROM productcategories WHERE productid = %s;", (productid,))
                handle_categories(productid, data['categories'])

            # Etiketleri güncelle
            if 'tags' in data:
                # Önceki etiketleri sil (veya güncelleme stratejinize göre ayarlayın)
                cursor.execute("DELETE FROM producttags WHERE productid = %s;", (productid,))
                handle_tags(productid, data['tags'])

            # Varyasyonları güncelle
            if 'variations' in data:
                # Önceki varyasyonları sil (veya güncelleme stratejinize göre ayarlayın)
                cursor.execute("DELETE FROM variations WHERE productid = %s;", (productid,))
                handle_variations_and_sizes(productid, data['variations'])

            # Resimleri güncelle
            if 'images' in data:
                # Önceki resimleri sil (veya güncelleme stratejinize göre ayarlayın)
                cursor.execute("DELETE FROM images WHERE productid = %s;", (productid,))
                handle_images(productid, data['images'])

            db_conn.commit()
            return jsonify(message='Product updated successfully'), 200
    except Exception as e:
        db_conn.rollback()
        error_message = f'Error in api: updateProduct: {e}'
        app.logger.error(error_message)
        return jsonify(error=error_message), 500



@app.route('/api/allproducts', methods=['GET'])
def all_products():
    try:
        with db_conn.cursor() as cursor:
            query = 'SELECT * FROM products'
            cursor.execute(query)
            products = []
            for row in cursor.fetchall():
                print(row)
                productid = row[0]
                barcode = row[1]
                name = row[2]
                price = row[3]
                discountpercentage = row[4]
                newyn = row[5]
                shortdescription = row[8]
                fulldescription = row[9]
                instagramurl = row[10]
                youtubeurl = row[11]
                twitterurl = row[12]
                facebookurl = row[13]
                linkedinurl = row[14]

                product = {
                    'id': productid,
                    'barcode': barcode,
                    'name': name,
                    'price': price,
                    'discountpercentage': discountpercentage,
                    'newyn': newyn,
                    'shortdescription': shortdescription,
                    'fulldescription': fulldescription,
                    'instagramurl': instagramurl,
                    'youtubeurl': youtubeurl,
                    'twitterurl': twitterurl,
                    'facebookurl': facebookurl,
                    'linkedinurl': linkedinurl,
                    'images': [],
                    'variations': [],
                    'categories': [],
                    'tags': []
                }
                products.append(product)
            return jsonify(products = products), 200
    except Exception as e:
        error_trace = traceback.format_exc()
        error_message = f'Error in api: search_products: {e}, Traceback: {error_trace}'
        app.logger.error(error_message)
        return jsonify(error=error_message), 500

#Highlights CRUD



@app.route('/api/highlights', methods=['POST'])
def add_highlight():
    try:
        data = request.get_json()

        image_url = data['imageurl']
        thumbnail_url = data['thumbnailurl']
        with db_conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO highlights (createtimestamp, createuser, dataorigin, productid, title, subtitle, redirecturl, sortnumber, activeyn)
                VALUES (CURRENT_TIMESTAMP, %s,  %s, %s, %s, %s, %s, %s, %s) RETURNING id;
            """, (data['createuser'], data['dataorigin'], data['productid'], data['title'], data['subtitle'], data['redirecturl'], data.get('sortnumber', -1), data['activeyn']))
            highlight_id = cursor.fetchone()[0]
            # Insert into images table
            cursor.execute("""
                INSERT INTO images (createtimestamp, createuser,  dataorigin,  highlightid,  filename, mimetype, imageurl, type)
                VALUES (CURRENT_TIMESTAMP, %s,  %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            """, ( data['createuser'], data['dataorigin'],   highlight_id,  data['filename'], data['mimetype'], data['imageurl'], 'image'))

            # Insert into images table
            cursor.execute("""
                INSERT INTO images (createtimestamp, createuser,  dataorigin,  highlightid,  filename, mimetype, imageurl, type)
                VALUES (CURRENT_TIMESTAMP, %s,  %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            """, ( data['createuser'], data['dataorigin'],   highlight_id,  data['filename'], data['mimetype'], thumbnail_path, 'thumbnail'))

            db_conn.commit()
            return jsonify(success='Highlight and associated image added successfully.'), 200

    except Exception as e:
        error_message = f'Error in api: add_highlight: {e}'
        app.logger.error(error_message)
        return jsonify(error=error_message), 500


@app.route('/api/highlights/<int:highlight_id>', methods=['DELETE'])
def delete_highlight(highlight_id):
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("DELETE FROM highlights WHERE id = %s;", (highlight_id,))
            db_conn.commit()
            return jsonify(success='Highlight deleted successfully.'), 200
    except Exception as e:
        error_message = f'Error in api: delete_highlight: {e}'
        app.logger.error(error_message)
        return jsonify(error=error_message), 500

@app.route('/api/highlights/<int:highlight_id>', methods=['PUT'])
def update_highlight(highlight_id):
    try:
        with db_conn.cursor() as cursor:
            data = request.json
            cursor.execute("""
                UPDATE highlights
                SET productid = %s, title = %s, subtitle = %s, url = %s, filename = %s, mimetype = %s, imageurl = %s, sortnumber = %s
                WHERE id = %s;
            """, (data['productid'], data['title'], data['subtitle'], data['url'], data['filename'], data['mimetype'], data['imageurl'], data['sortnumber'],  highlight_id))
            db_conn.commit()
            return jsonify(success='Highlight updated successfully.'), 200
    except Exception as e:
        error_message = f'Error in api: update_highlight: {e}'
        app.logger.error(error_message)
        return jsonify(error=error_message), 500

@app.route('/api/highlights', methods=['GET'])
def get_highlights():
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT * FROM highlights order by sortnumber")
            highlight_records = cursor.fetchall()

            highlights = []
            for record in highlight_records:
                # 'imageurl' alanını bytes'a dönüştür
                base64content_bytes = bytes(record[7])

                # Bytes veriyi UTF-8 string'e çevir
                base64content_str = base64content_bytes.decode('utf-8')

                highlight = {
                    'id': record[0],
                    'productid': record[1],
                    'title': record[2],
                    'subtitle': record[3],
                    'url': record[4],
                    'filename': record[5],
                    'mimetype': record[6],
                    'imageurl': base64content_str,
                    'sortnumber': record[8]
                }
                highlights.append(highlight)
            return jsonify(highlights = highlights), 200
    except Exception as e:
        error_message = f'Error in api: get_highlights: {e}'
        app.logger.error(error_message)
        return jsonify(error=error_message), 500

@app.route('/api/products/<int:productid>', methods=['DELETE'])
def delete_product(productid):
    try:
        with db_conn.cursor() as cursor:
            # Ürünü sil
            cursor.execute("DELETE FROM products WHERE id = %s;", (productid,))
            db_conn.commit()
            return jsonify(success='Product deleted successfully.'), 200
    except Exception as e:
        error_message = f'Error in api: delete_product: {e}'
        app.logger.error(error_message)
        return jsonify(error=error_message), 500

    
def list_categories():
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT id, name FROM categories order by id")
            category_records = cursor.fetchall()

        categories = []
        for category_record in category_records:
            category_id = category_record[0]
            category_name = category_record[1]
            category = {
                'id': category_id,
                'name': category_name
            }
            categories.append(category)
        return jsonify(categories=categories), 200
    except Exception as e:
        error_message = f'Error in api: list_categories: {e}'
        app.logger.error(error_message)
        return jsonify(error=error_message), 500

@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT * FROM categories order by id")
            category_records = cursor.fetchall()

            categories = []
            for category_record in category_records:
                category_id = category_record[0]
                category_name = category_record[1]
                category = {
                    'id': category_id,
                    'name': category_name
                }
                categories.append(category)
            return jsonify(categories=categories), 200
    except Exception as e:
        error_message = f'Error in api: get_categories: {e}'
        app.logger.error(error_message)
        return jsonify(error=error_message), 500
    

@app.route('/api/tags', methods=['GET'])
def get_tags():
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT * FROM tags order by id")
            tag_records = cursor.fetchall()

            tags = []
            for tag_record in tag_records:
                tag_id = tag_record[0]
                tag_name = tag_record[1]
                tag = {
                    'id': tag_id,
                    'name': tag_name
                }
                tags.append(tag)
            return jsonify(tags=tags), 200
    except Exception as e:
        error_message = f'Error in api: get_tags: {e}'
        app.logger.error(error_message)
        return jsonify(error=error_message), 500
    
@app.route('/api/variations', methods=['GET'])
def get_variations():
    try:
        productid = request.args.get('productId')
        with db_conn.cursor() as cursor:
            if productid:
                cursor.execute("SELECT color, mimetype, imageurl, filename FROM variations WHERE productid = %s", (productid,))
            else:
                cursor.execute("SELECT color, mimetype, imageurl, filename FROM variations")
            
            variation_records = cursor.fetchall()
            # Varyasyonları JSON nesnesine dönüştür
            variations = []
            for variation_record in variation_records:
                color = variation_record[0]
                mimetype = variation_record[1]
                base64content_bytes = bytes(variation_record[2])
                imageurl = base64content_bytes.decode('utf-8')
                filename = variation_record[3]
                variation = {
                    'color': color,
                    'image': {'name':filename,
                            'mimetype':mimetype,
                            'imageurl':imageurl},
                    'sizes': []
                }

                sizes_query = "SELECT name, stock FROM sizes WHERE variationid IN (SELECT id FROM variations WHERE productid = %s AND color = %s)"
                cursor.execute(sizes_query, (productid, color))
                size_records = cursor.fetchall()

                sizes = []
                for size_record in size_records:
                    size_name = size_record[0]
                    size_stock = size_record[1]
                    size = {
                        'name': size_name,
                        'stock': size_stock
                    }
                    sizes.append(size)

                variation['sizes'] = sizes
                variations.append(variation)
            return jsonify(variations=variations), 200
    except Exception as e:
        error_message = f'Error in api get_variations: {e}'
        app.logger.error(error_message)
        return jsonify(error=error_message), 500


@app.route('/api/products', methods=['POST'])
def addProduct():
    try:
        with db_conn.cursor() as cursor:
            data = request.get_json()
            product = data

            # Ürün bilgilerini hazırla
            barcode = product.get('barcode', datetime.datetime.now().strftime('%Y%m%d%H%M%S'))
            name = product.get('name', '')
            price = product.get('price', 0)
            discountpercentage = product.get('discountpercentage', 0)
            newyn = product.get('newyn', False)
            shortdescription = product.get('shortdescription', '')
            fulldescription = product.get('fulldescription', '')
            instagramurl = product.get('instagramurl', '')
            youtubeurl = product.get('youtubeurl', '')
            twitterurl = product.get('twitterurl', '')
            facebookurl = product.get('facebookurl', '')
            linkedinurl = product.get('linkedinurl', '')

            # Ürünü veritabanına ekle
            cursor.execute("""
                INSERT INTO products (barcode, name, price, discountpercentage, newyn,  shortdescription, fulldescription, instagramurl, youtubeurl, twitterurl, facebookurl, linkedinurl)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id;
            """, (barcode, name, price, discountpercentage, newyn,   shortdescription, fulldescription, instagramurl, youtubeurl, twitterurl, facebookurl, linkedinurl))
            productid = cursor.fetchone()[0]

            # İlişkili verileri ekle
            print(product.get('variations'))
            handle_categories(productid, product.get('categories', []))
            handle_tags(productid, product.get('tags', []))
            handle_variations_and_sizes(productid, product.get('variations', []))
            handle_images(productid, product.get('images', []))

            db_conn.commit()
            return jsonify(message='Product and images added successfully'), 201
    except Exception as e:
        db_conn.rollback()
        error_trace = traceback.format_exc()
        error_message = f'Error in api: handle_categories: {e}, product:{product}, Traceback: {error_trace}'
        app.logger.error(error_message)
        return jsonify(error=error_message), 500


def handle_categories(productid, categories):
    try:
        with db_conn.cursor() as cursor:
            # Fetch existing category IDs
            cursor.execute("SELECT categoryid FROM productcategories WHERE productid = %s;", (productid,))
            existing_categories = set(row[0] for row in cursor.fetchall())

            # 'categories' is already a list of category IDs, so use it directly
            updated_category_ids = set(categories)

            # Determine categories to delete and add
            categories_to_delete = existing_categories - updated_category_ids
            categories_to_add = updated_category_ids - existing_categories

            # Delete and Add operations
            if categories_to_delete:
                cursor.executemany("DELETE FROM productcategories WHERE productid = %s AND categoryid = %s;", [(productid, cat) for cat in categories_to_delete])

            if categories_to_add:
                cursor.executemany("INSERT INTO productcategories (productid, categoryid) VALUES (%s, %s);", [(productid, cat) for cat in categories_to_add])
    except Exception as e:
        db_conn.rollback()
        error_trace = traceback.format_exc()
        error_message = f'Error in api: handle_categories: {e}, updated_categories:{categories}, productid:{productid} Traceback: {error_trace}'
        app.logger.error(error_message)
        raise



def handle_tags(productid, tags):
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT tagid FROM producttags WHERE productid = %s;", (productid,))
            existing_tags = set(row[0] for row in cursor.fetchall())

            updated_tags_set = set(tags)
            tags_to_delete = existing_tags - updated_tags_set
            tags_to_add = updated_tags_set - existing_tags

            if tags_to_delete:
                cursor.executemany("DELETE FROM producttags WHERE productid = %s AND tagid = %s;", [(productid, tag) for tag in tags_to_delete])

            if tags_to_add:
                cursor.executemany("INSERT INTO producttags (productid, tagid) VALUES (%s, %s);", [(productid, tag) for tag in tags_to_add])

    except Exception as e:
        error_trace = traceback.format_exc()
        db_conn.rollback()
        error_message = f'Error in api: handle_tags: {e}, updated_tags:{tags}, productid:{productid} Traceback: {error_trace}'
        app.logger.error(error_message)
        raise

def handle_images(productid, updated_images):
    try:
        with db_conn.cursor() as cursor:
            # Mevcut resimlerin listesini al
            cursor.execute("SELECT filename FROM images WHERE productid = %s;", (productid,))
            existing_images = set(row[0] for row in cursor.fetchall())

            updated_images_set = set(img.get('filename') for img in updated_images if img.get('filename'))
            images_to_delete = existing_images - updated_images_set
            images_to_add = updated_images_set - existing_images

            # Eski resimleri sil
            if images_to_delete:
                cursor.executemany("DELETE FROM images WHERE productid = %s AND filename = %s;", [(productid, img) for img in images_to_delete])

            # Yeni resimleri ekle
            for image in updated_images:
                filename = image.get("filename")
                if filename in images_to_add:
                    # Dosya yolu URL'sini veritabanına kaydet
                    file_url = os.path.join(IMAGES_PATH, filename)
                    cursor.execute("""
                        INSERT INTO images (productid, filename, url)
                        VALUES (%s, %s, %s);
                    """, (productid, filename, file_url))

            db_conn.commit()
    except Exception as e:
        db_conn.rollback()  # Rollback in case of error
        error_trace = traceback.format_exc()
        error_message = f'Error in handle_images: {e}, productid: {productid}, updated_images: {updated_images} Traceback: {error_trace}'
        app.logger.error(error_message)
        return False, error_message

def handle_variations_and_sizes(productid, variations):
    try:
        with db_conn.cursor() as cursor:
            for variation in variations:
                print(variation)
                color = variation.get('color', {})
                image = variation.get('image', {})
                filename = image.get('name')
                mimetype = image.get('mimetype')
                imageurl = image.get('imageurl')
                sizes = variation.get('sizes', [])

                cursor.execute("SELECT id FROM variations WHERE productid = %s AND color = %s;", (productid, color))
                result = cursor.fetchone()
                if result:
                    variationid = result[0]
                    cursor.execute("""
                        UPDATE variations
                        SET filename = %s, mimetype = %s, imageurl = %s
                        WHERE id = %s;
                    """, (filename, mimetype, imageurl, variationid))
                else:
                    cursor.execute("""
                        INSERT INTO variations (productid, color, filename, mimetype, imageurl)
                        VALUES (%s, %s, %s, %s, %s)
                        RETURNING id;
                    """, (productid, color, filename, mimetype, imageurl))
                    variationid = cursor.fetchone()[0]

                handle_sizes(cursor, variationid, sizes)
    except Exception as e:
        db_conn.rollback()  # Rollback in case of error
        error_trace = traceback.format_exc()
        error_message = f'Error in handle_variations_and_sizes: {e}, productid: {productid}, variations: {variations} Traceback: {error_trace}'
        app.logger.error(error_message)
        return False, error_message


def handle_sizes(cursor, variationid, sizes):
    cursor.execute("SELECT name FROM sizes WHERE variationid = %s;", (variationid,))
    existing_sizes = set(row[0] for row in cursor.fetchall())

    updated_sizes_set = set(size.get('name') for size in sizes if size.get('name'))
    sizes_to_delete = existing_sizes - updated_sizes_set
    sizes_to_add = updated_sizes_set - existing_sizes

    if sizes_to_delete:
        cursor.executemany("DELETE FROM sizes WHERE variationid = %s AND name = %s;", [(variationid, size) for size in sizes_to_delete])

    for size in sizes:
        if size.get('name') in sizes_to_add:
            stock = size.get('stock')
            cursor.execute("""
                INSERT INTO sizes (variationid, name, stock)
                VALUES (%s, %s, %s);
            """, (variationid, size.get('name'), stock))

    for size in sizes:
        if size.get('name') in existing_sizes:
            stock = size.get('stock')
            cursor.execute("""
                UPDATE sizes
                SET stock = %s
                WHERE variationid = %s AND name = %s;
            """, (stock, variationid, size.get('name')))


@app.route('/api/products', methods=['GET'])
@app.route('/api/products/<int:productid>', methods=['GET'])
@app.route('/api/products/category/<category>', methods=['GET'])
def get_products(productid=None, category=None):
    try:
        with db_conn.cursor() as cursor:
            if productid is not None:
                query = 'SELECT * FROM products WHERE id = %s ORDER BY id'
                cursor.execute(query, (productid,))
            elif category is not None:
                if category.isdigit():
                    query = 'SELECT p.* FROM products p JOIN productcategories pc ON p.id = pc.productid WHERE pc.categoryid = %s ORDER BY p.id'
                    cursor.execute(query, (int(category),))
                else:
                    query = 'SELECT p.* FROM products p JOIN productcategories pc ON p.id = pc.productid JOIN categories c ON pc.categoryid = c.id WHERE c.name = %s ORDER BY p.id'
                    cursor.execute(query, (category,))
            else:
                query = 'SELECT * FROM products ORDER BY id'
                cursor.execute(query)

            products = [create_product(row, cursor) for row in cursor.fetchall()]
            return jsonify(products=products), 200
    except Exception as e:
        error_trace = traceback.format_exc()
        error_message = f'Error in api: get_products: {e}, productid: {productid}, category: {category}. Traceback: {error_trace}'
        app.logger.error(error_message)
        return jsonify(error=error_message), 500

#expected body:
        #{
        #   "activeuserid" : 12,
        #    "categories": [1, 2, 3],
        #    "tags": ["tag1", "tag2"],
        #    "colors": ["Red", "Blue"],
        #     "sizes": ["S", "M"],
        #    "search_criteria": {
        #        "min_price": 100,
        #        "max_price": 500,
        #        "in_stock": true,
        #        ...
        #    }
        #}
#expected return json:
@app.route('/api/listproducts', methods=['GET'])
def get_listproducts():
    filters={}
    try:
        filters = request.get_json(silent=True) or {}
        productid = request.headers.get('productid')
        # Sütun sıralamasını create_listproduct fonksiyonuna uygun hale getir
        base_query = "SELECT DISTINCT p.id, p.name, p.barcode, p.price, p.discountpercentage, p.shortdescription, p.fulldescription, p.newyn, p.cargofree FROM products p"
        where_clauses = ["WHERE p.deletedyn = FALSE"]  # Deleted ürünleri filtrele
        joins = []
        params = []
        activeuserid = None

        # Ürün ID'si filtresi
        if productid:
            where_clauses.append("p.id = %s")
            params.append(productid)

        if filters:
            if 'activeuserid' in filters:
                activeuserid = filters['activeuserid']
            if 'categories' in filters:
                joins.append("JOIN productcategories pc ON p.id = pc.productid")
                where_clauses.append("pc.categoryid IN %s")
                params.append(tuple(filters['categories']))

            if 'tags' in filters:
                joins.append("JOIN producttags pt ON p.id = pt.productid")
                where_clauses.append("pt.tagid IN %s")
                params.append(tuple(filters['tags']))

            if 'colors' in filters or 'sizes' in filters:
                joins.append("JOIN variations v ON p.id = v.productid")

            if 'colors' in filters:
                where_clauses.append("v.colorid IN %s")
                params.append(tuple(filters['colors']))

            if 'sizes' in filters:
                joins.append("JOIN sizes s ON v.id = s.variationid")
                where_clauses.append("s.id IN %s")
                params.append(tuple(filters['sizes']))

            if 'searchcriteria' in filters:
                search = filters['searchcriteria']
                if 'minprice' in search:
                    where_clauses.append("p.price >= %s")
                    params.append(search['minprice'])
                if 'maxprice' in search:
                    where_clauses.append("p.price <= %s")
                    params.append(search['maxprice'])
                if 'text' in search:
                    text = f"%{search['text']}%".lower()
                    where_clauses.append("(lower(p.name) LIKE %s OR lower(p.shortdescription) LIKE %s or lower(p.fulldescription) LIKE %s or lower(p.productdetails) LIKE %s)")
                    params.extend([text, text, text, text])

        # Sorguyu birleştirme
        query = f"{base_query} {' '.join(joins)} {' AND '.join(where_clauses)} ORDER BY p.id" if where_clauses else f"{base_query} ORDER BY p.id"
        print(query)
        with db_conn.cursor() as cursor:
            cursor.execute(query, params)
            products = [create_listproduct(row, cursor, activeuserid) for row in cursor.fetchall()]
            return jsonify(products=products), 200

    except Exception as e:
        error_trace = traceback.format_exc()
        error_message = f'Error in api: get_products: {e}. filters: {filters} Traceback: {error_trace}'
        app.logger.error(error_message)
        return jsonify(error=error_message), 500


def create_listproduct(row, cursor, activeuserid):
    # Ürün bilgilerini ayıklama
    productid, name, barcode, price, discountpercentage, shortdescription, fulldescription, newyn, cargofree = row

    infavorites = check_infavorites(productid, activeuserid, cursor)
    finalprice = price * discountpercentage / 100;#calculate_finalprice(price, discountpercentage)  # Final fiyat hesaplama

    # İlgili bilgileri çekmek için yardımcı fonksiyonlar
    brand = fetch_brand(cursor, productid)
    categories = fetch_categories(cursor, productid)
    tags = fetch_tags(cursor, productid)
    variations = fetch_variations(cursor, productid)
    thumbnails = fetch_thumbnails(cursor, productid)
    mastercoupons = fetch_mastercoupons(cursor, productid)
    reviewdetails = fetch_reviewdetails(cursor, productid)
    return {
        'id': productid,
        'name': name,
        'barcode': barcode,
        'price': price,
        'finalprice': finalprice,
        'discountpercentage': discountpercentage,
        'shortdescription': shortdescription,
        'fulldescription': fulldescription,
        'newyn': newyn,
        'cargofree': cargofree,
        'ratingpercentage':reviewdetails.ratingpercentage,
        'reviewcount': reviewdetails.reviewcount,
        'photoreview': reviewdetails.photoreview,
        'infavorites': infavorites,
        'brand': brand,
        'categories': categories,
        'tags': tags,
        'variations': variations,
        'thumbnails': thumbnails,
        'mastercoupons': mastercoupons
    }


def check_infavorites(productid, activeuserid, cursor):
    cursor.execute("SELECT id FROM userfavorites WHERE productid = %s AND userid = %s AND deletedyn = FALSE", (productid, activeuserid))
    return cursor.fetchone() is not None

def fetch_reviewdetails(cursor, productid):
    # Yorum sayısı ve ortalama puanı hesaplama
    cursor.execute("SELECT COUNT(*), AVG(rate) FROM reviews WHERE productid = %s AND deletedyn = FALSE", (productid,))
    review_count, average_rating = cursor.fetchone()

    # Fotoğraflı yorum sayısını hesaplama
    cursor.execute("SELECT COUNT(*) FROM reviews WHERE productid = %s AND photoreview = TRUE AND deletedyn = FALSE", (productid,))
    photoreview_count = cursor.fetchone()[0]

    # Yorumların ortalama puanını 5 üzerinden ve yüzde olarak hesaplama
    rating_star = average_rating if average_rating is not None else 0
    rating_percentage = (rating_star / 5.0) * 100

    return {
        'productid': productid,
        'reviewcount': review_count,
        'photoreview': photoreview_count > 0,
        'photoreviewcount': photoreview_count,
        'ratingpercentage': rating_percentage,
        'ratingstar': rating_star
    }

def fetch_brand(cursor, productid):
    cursor.execute("SELECT b.id, b.name, b.redirecturl FROM brands b JOIN products p ON p.brandid = b.id WHERE p.id = %s AND b.deletedyn = FALSE", (productid,))
    return next(({'id': id, 'name': name, 'url': url} for id, name, url in cursor.fetchall()), None)

def fetch_categories(cursor, productid):
    cursor.execute("SELECT c.id, c.name, c.parentcategoryid FROM categories c JOIN productcategories pc ON pc.categoryid = c.id WHERE pc.productid = %s AND c.deletedyn = FALSE", (productid,))
    return [{'id': id, 'name': name, 'parentcategoryid': parentid} for id, name, parentid in cursor.fetchall()]

def fetch_tags(cursor, productid):
    cursor.execute("SELECT t.id, t.name FROM tags t JOIN producttags pt ON pt.tagid = t.id WHERE pt.productid = %s AND t.deletedyn = FALSE", (productid,))
    return [{'id': id, 'name': name} for id, name in cursor.fetchall()]

def fetch_variations(cursor, productid):
    cursor.execute("SELECT v.id, v.filename, v.mimetype, v.imageurl, v.colorid FROM variations v WHERE v.productid = %s AND v.deletedyn = FALSE", (productid,))
    return [{
        'id': id,
        'filename': filename,
        'mimetype': mimetype,
        'imageurl': imageurl,
        'color': fetch_colors(cursor, colorid),
        'sizes': fetch_sizes(cursor, id)
    } for id, filename, mimetype, imageurl, colorid in cursor.fetchall()]

def fetch_sizes(cursor, variationid):
    cursor.execute("SELECT s.id, s.name, s.stock FROM sizes s WHERE s.variationid = %s AND s.deletedyn = FALSE", (variationid,))
    return [{'id': id, 'name': name, 'stock': stock} for id, name, stock in cursor.fetchall()]

def fetch_thumbnails(cursor, productid):
    cursor.execute("SELECT i.id, i.filename, i.mimetype, i.imageurl FROM images i WHERE i.productid = %s AND i.type = 'thumbnail' AND i.deletedyn = FALSE", (productid,))
    return [{'id': id, 'filename': filename, 'mimetype': mimetype, 'imageurl': imageurl} for id, filename, mimetype, imageurl in cursor.fetchall()]


def fetch_mastercoupons(cursor, productid):
    cursor.execute("SELECT mc.id, mc.name, mc.amount, mc.type, mc.icon FROM mastercoupons mc WHERE mc.productid = %s AND mc.deletedyn = FALSE", (productid,))
    return [{'id': id, 'name': name, 'amount': amount, 'type': type, 'icon': icon} for id, name, amount, type, icon in cursor.fetchall()]


def fetch_images(cursor, productid):
    cursor.execute("SELECT i.id, i.filename, i.mimetype, i.imageurl FROM images i WHERE i.productid = %s AND i.type = 'image' AND i.deletedyn = FALSE", (productid,))
    return [{'id': id, 'filename': filename, 'mimetype': mimetype, 'imageurl': imageurl} for id, filename, mimetype, imageurl in cursor.fetchall()]

def fetch_colors(cursor, colorid):
    cursor.execute("SELECT id, name, hex, red, green, blue FROM colors WHERE id = %s AND deletedyn = FALSE", (colorid,))
    return next(({'id': id, 'name': name, 'hex': hex, 'red': red, 'green': green, 'blue': blue} for id, name, hex, red, green, blue in cursor.fetchall()), None)

# Kategori Ekleme
@app.route('/api/categories', methods=['POST'])
def add_category():
    try:
        data = request.get_json()
        with db_conn.cursor() as cursor:
            cursor.execute("INSERT INTO categories (name) VALUES (%s) RETURNING id;", (data['name'],))
            category_id = cursor.fetchone()[0]
            db_conn.commit()
            return jsonify(id=category_id), 201
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

# Kategori Güncelleme
@app.route('/api/categories/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    try:
        data = request.get_json()
        print(data)
        with db_conn.cursor() as cursor:
            cursor.execute("UPDATE categories SET name = %s WHERE id = %s;", (data['name'], category_id))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

# Kategori Silme
@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("DELETE FROM categories WHERE id = %s;", (category_id,))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

# Etiket Ekleme
@app.route('/api/tags', methods=['POST'])
def add_tag():
    try:
        data = request.get_json()
        with db_conn.cursor() as cursor:
            cursor.execute("INSERT INTO tags (name) VALUES (%s) RETURNING id;", (data['name'],))
            tag_id = cursor.fetchone()[0]
            db_conn.commit()
            return jsonify(id=tag_id), 201
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

# Etiket Güncelleme
@app.route('/api/tags/<int:tag_id>', methods=['PUT'])
def update_tag(tag_id):
    try:
        data = request.get_json()
        with db_conn.cursor() as cursor:
            cursor.execute("UPDATE tags SET name = %s WHERE id = %s;", (data['name'], tag_id))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

# Etiket Silme
@app.route('/api/tags/<int:tag_id>', methods=['DELETE'])
def delete_tag(tag_id):
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("DELETE FROM tags WHERE id = %s;", (tag_id,))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

if __name__ == '__main__':
    handler = logging.FileHandler('app.log')  # Logları app.log dosyasına yaz
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)
    create_upload_folder_if_not_exists(UPLOAD_PATH)
    create_upload_folder_if_not_exists(IMAGES_PATH)
    create_upload_folder_if_not_exists(THUMBNAILS_PATH)
    app.run(port=5000)
