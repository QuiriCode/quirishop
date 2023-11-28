from flask import Flask, request, jsonify
import logging
from flask_cors import CORS
from werkzeug.utils import secure_filename
import psycopg2
import os
import base64
import re
import sys
import requests

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)
CORS(app)

@app.before_request
def log_request_info():
    app.logger.info('Headers: %s', request.headers)
    app.logger.info('Body: %s', request.get_data())

if len(sys.argv) > 1 and sys.argv[1] == 'prod':
    db_host = 'quiri.shop'
else:
    db_host = 'localhost'
print("Connecting to {db_host}...")

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
db_cursor = db_conn.cursor()

UPLOAD_FOLDER = 'images'

def save_image_from_base64(base64content, filename):
    with open(filename, "wb") as file:
        file.write(base64.b64decode(base64content))

@app.route('/api/products', methods=['DELETE'])
def delete_products():
    product_id = request.headers.get('productid')

    if product_id:
        # Tek bir ürünü silme
        #TODO: Doğru id'ler ile silme işlemi gerçekleştir
        db_cursor.execute("""
            DELETE FROM productTags WHERE product_id = %s;
            DELETE FROM sizes WHERE product_id = %s;
            DELETE FROM variations WHERE product_id = %s;
            DELETE FROM productCategories WHERE product_id = %s;
            DELETE FROM productImages WHERE product_id = %s;
            DELETE FROM products WHERE id = %s;
        """, (product_id, product_id, product_id, product_id))
    else:
        # Tüm ürünleri silme
        db_cursor.execute("""
            DELETE FROM categories;
            DELETE FROM productcategories;
            DELETE FROM productimages;
            DELETE FROM products;
            DELETE FROM producttags;
            DELETE FROM sizes;
            DELETE FROM tags;
            DELETE FROM variations;
        """)

    db_conn.commit()  # Değişiklikleri veritabanına kaydet
    return jsonify(message='Products deleted successfully'), 200


@app.route('/api/listcategories', methods=['GET'])
def list_categories():
    try:
        db_cursor.execute("SELECT id, name FROM categories")
        category_records = db_cursor.fetchall()

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
        print('Error listing categories:', e)
        return jsonify(error='An error occurred while listing categories.'), 500

@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        db_cursor.execute("SELECT * FROM categories")
        category_records = db_cursor.fetchall()

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
        print('Error getting categories:', e)
        return jsonify(error='An error occurred while getting categories.'), 500


@app.route('/api/products', methods=['POST'])
def addProduct():
    data = request.get_json()  # Gelen isteğin JSON verisini al
    product = data  # Product bilgisini al, varsayılan olarak boş bir sözlük kullan
    variations = data.get('variation', [])  # "variation" anahtarının değerini al, varsayılan olarak boş bir liste kullan
    image_infos = data.get('images', [])  # "image" anahtarının değerini al, varsayılan olarak boş bir liste kullan
    print("Barcode:", product['barcode'])
    print("Name:", product['name'])
    print("Price:", product['price'])
    print("Discount:", product['discount'])
    print("New:", product['new'])
    print("Rating:", product['rating'])
    print("Sale Count:", product['saleCount'])
    print("Short Description:", product['shortDescription'])
    print("Full Description:", product['fullDescription'])
    print("Instagram URL:", product['instagramurl'])
    print("Youtube URL:", product['youtubeurl'])
    print("Twitter URL:", product['twitterurl'])
    print("Facebook URL:", product['facebookurl'])
    print("LinkedIn URL:", product['linkedinurl'])

    # Ürünü products tablosuna ekle
    db_cursor.execute("""
        INSERT INTO products (barcode, name, price, discount, new, rating, saleCount, shortDescription, fullDescription, instagramurl, youtubeurl, twitterurl, facebookurl, linkedinurl)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
    """, (
        product['barcode'], product['name'], product['price'], product['discount'], 
        product['new'], product['rating'], product['saleCount'], product['shortDescription'], 
        product['fullDescription'], product['instagramurl'], product['youtubeurl'], product['twitterurl'], 
        product['facebookurl'], product['linkedinurl']
    ))

    productid = db_cursor.fetchone()[0]  # Eklenen ürünün id'sini al

    # Kategori, etiket ve varyasyon işlemlerini gerçekleştir
    add_categories(productid, product['category'])
    add_tags(productid, product['tag'])
    add_variations(productid, variations)
    add_images(productid, image_infos)

    db_conn.commit()  # Değişiklikleri veritabanına kaydet
    return jsonify(message='Product and images added successfully'), 201

def add_categories(productid, categories):
    for category in categories:
        category_name = category.get('name')
        
        if category_name:
            # Kategori adını categories tablosunda ara
            db_cursor.execute("""
                SELECT id FROM categories WHERE name = %s;
            """, (category_name,))

            categoryid = db_cursor.fetchone()

            if categoryid is None:
                # Kategori bulunamadı, yeni bir kategori ekleyin
                db_cursor.execute("""
                    INSERT INTO categories (name)
                    VALUES (%s)
                    RETURNING id;
                """, (category_name,))
                
                categoryid = db_cursor.fetchone()[0]
            else:
                categoryid = categoryid[0]  # Kategori id'sini al

            # Ürünü ve kategori_id'sini productCategories tablosuna ekle
            db_cursor.execute("""
                INSERT INTO productcategories (productid, categoryid)
                VALUES (%s, %s);
            """, (productid, categoryid))

def add_tags(productid, tags):
    for tag in tags:
        tag_name = tag.get('name')
        
        if tag_name:
            # Etiket adını tags tablosunda ara
            db_cursor.execute("""
                SELECT id FROM tags WHERE name = %s;
            """, (tag_name,))
            
            tagid = db_cursor.fetchone()

            if tagid is None:
                # Etiket bulunamadı, yeni bir etiket ekleyin
                db_cursor.execute("""
                    INSERT INTO tags (name)
                    VALUES (%s)
                    RETURNING id;
                """, (tag_name,))
                
                tagid = db_cursor.fetchone()[0]
            else:
                tagid = tagid[0]  # Etiket id'sini al

            # Ürünü ve tagid'sini productTags tablosuna ekle
            db_cursor.execute("""
                INSERT INTO productTags (productid, tagid)
                VALUES (%s, %s);
            """, (productid, tagid))

def add_variations(productid, variations):
    for variation in variations:
        color = variation.get('color')
        image = variation.get('image')
        
        if color and image:
            name = image["name"]
            mimetype = image["mimetype"]
            base64content = image["base64content"]
            image_path = os.path.join(UPLOAD_FOLDER, name)
            save_image_from_base64(base64content, image_path)

            db_cursor.execute("""
                INSERT INTO variations (productid, color, filename, mimetype, base64content)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id;
            """, (productid, color, name, mimetype, base64content))
            variationid = db_cursor.fetchone()[0] 
            sizes = variation.get('size', [])
            add_sizes(variationid, sizes)
            
def add_images(productid, images):
    for image in images:
        name = image["name"]
        mimetype = image["mimetype"]
        base64content = image["base64content"]

        # Resim dosya yolunu belirle
        image_path = os.path.join(UPLOAD_FOLDER, name)

        # Base64 içeriği dosyaya kaydet
        save_image_from_base64(base64content, image_path)

        # Veritabanına resim kaydetme işlemini gerçekleştir
        db_cursor.execute("""
            INSERT INTO productimages (productid, filename, mimetype, base64content)
            VALUES (%s, %s, %s, %s);
        """, (productid, name, mimetype, base64content))




def add_sizes(variationid, sizes):
    for size in sizes:
        name = size.get('name')
        stock = size.get('stock')

        if name and stock:
            # Boyutu sizes tablosuna ekle
            db_cursor.execute("""
                INSERT INTO sizes (variationid, name, stock)
                VALUES (%s, %s, %s);
            """, (variationid, name, stock))
@app.route('/api/products', methods=['GET'])
def search_products():
    try:
        
        search = request.args.get('search')

        if search:
            query = 'SELECT * FROM products WHERE name ILIKE %s'
            db_cursor.execute(query, ('%' + search + '%',))
        else:
            query = 'SELECT * FROM products'
            db_cursor.execute(query)

        products = []
        for row in db_cursor.fetchall():
            product_id = row[0]
            barcode = row[1]
            name = row[2]
            price = row[3]
            discount = row[4]
            new = row[5]
            rating = row[6]
            saleCount = row[7]
            shortDescription = row[8]
            fullDescription = row[9]
            instagramurl = row[10]
            youtubeurl = row[11]
            twitterurl = row[12]
            facebookurl = row[13]
            linkedinurl = row[14]


            image_query = "SELECT filename, mimetype, base64content FROM productimages WHERE productid = %s"
            db_cursor.execute(image_query, (product_id,))
            image_records = db_cursor.fetchall()

            # Resim verilerini JSON'a yaz
            images = []
            for image_record in image_records:
                filename = image_record[0]
                mimetype = image_record[1]
                base64content = image_record[2]
                image_info = {
                    'name': filename,
                    'mimetype': mimetype,
                    'base64content': base64content
                }
                images.append(image_info)

            # Varyasyon bilgilerini al
            variation_query = "SELECT color, mimetype, base64content, filename FROM variations WHERE productid = %s"
            db_cursor.execute(variation_query, (product_id,))
            variation_records = db_cursor.fetchall()

            # Varyasyonları JSON nesnesine dönüştür
            variations = []
            for variation_record in variation_records:
                color = variation_record[0]
                mimetype = variation_record[1]
                base64content = variation_record[2]
                filename = variation_record[3]
                variation = {
                    'color': color,
                    'image': {'name':filename,
                              'mimetype':mimetype,
                              'base64content':base64content},
                    'sizes': []
                }

                sizes_query = "SELECT name, stock FROM sizes WHERE variationid IN (SELECT id FROM variations WHERE productid = %s AND color = %s)"
                db_cursor.execute(sizes_query, (product_id, color))
                size_records = db_cursor.fetchall()

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

            category_query = "SELECT c.id, c.name FROM productcategories pc LEFT JOIN categories c ON c.id=pc.categoryid WHERE pc.productid = %s"
            db_cursor.execute(category_query, (product_id,))
            category_records = db_cursor.fetchall()

            categories = []
            for category_record in category_records:
                category_id = category_record[0]
                category_name = category_record[1]
                category = {
                    'id': category_id,
                    'name': category_name
                }
                categories.append(category)

            tag_query = "SELECT t.id, t.name FROM producttags pt LEFT JOIN tags t ON t.id=pt.tagid WHERE pt.productid = %s"
            db_cursor.execute(tag_query, (product_id,))
            tag_records = db_cursor.fetchall()

            tags = []
            for tag_record in tag_records:
                tag_id = tag_record[0]
                tag_name = tag_record[1]
                tag = {
                    'id': tag_id,
                    'name': tag_name
                }
                tags.append(tag)

            product = {
                'id': product_id,
                'barcode': barcode,
                'name': name,
                'price': price,
                'discount': discount,
                'new': new,
                'rating': rating,
                'saleCount': saleCount,
                'shortDescription': shortDescription,
                'fullDescription': fullDescription,
                'instagramurl': instagramurl,
                'youtubeurl': youtubeurl,
                'twitterurl': twitterurl,
                'facebookurl': facebookurl,
                'linkedinurl': linkedinurl,
                'images': images,
                'variations': variations,
                'category': categories,
                'tag': tags
            }
            products.append(product)

        response = {
            'products': products
        }
        return jsonify(response), 200
    except Exception as e:
        print('Error fetching search results:', e)
        return jsonify(error='An error occurred while fetching search results.'), 500

if __name__ == '__main__':
    handler = logging.FileHandler('app.log')  # Logları app.log dosyasına yaz
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)
    app.run(port=5000)

