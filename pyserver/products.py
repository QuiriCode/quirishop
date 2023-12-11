from flask import Blueprint, request, jsonify, current_app
from db import db_conn, ensure_db_connection
import utilities  # Shared utility functions
import traceback  # Added import

products_blueprint = Blueprint('products', __name__)
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
@products_blueprint.route('/listproducts', methods=['GET'])
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
    cursor.execute("""
        SELECT v.id, i.filename, i.mimetype, i.imageurl, v.colorid 
        FROM variations v 
        JOIN images i ON v.id = i.variationid
        WHERE v.productid = %s AND v.deletedyn = FALSE
    """, (productid,))
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

    


@products_blueprint.route('/allproducts', methods=['GET'])
def all_products():
    app = current_app
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


@products_blueprint.route('/products', methods=['POST'])
def addProduct():
    app = current_app
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


@products_blueprint.route('/products/<int:productid>', methods=['PUT'])
def updateProduct(productid):
    app = current_app
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


@products_blueprint.route('/products/<int:productid>', methods=['DELETE'])
def delete_product(productid):
    app = current_app
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

@products_blueprint.route('/products', methods=['GET'])
@products_blueprint.route('/products/<int:productid>', methods=['GET'])
@products_blueprint.route('/products/category/<category>', methods=['GET'])
def get_products(productid=None, category=None):
    app = current_app
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

