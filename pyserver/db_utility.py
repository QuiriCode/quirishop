import traceback  # Added import
import psycopg2
import os
import sys

# Your existing DB setup code here
# No Flask specific imports needed here unless using Flask contexts

def handle_categories(productid, categories):
    app = current_app
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
    app = current_app
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
    app = current_app
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
    app = current_app
    try:
        with db_conn.cursor() as cursor:
            for variation in variations:
                colorid = variation.get('colorid')
                image = variation.get('image', {})
                filename = image.get('name')
                mimetype = image.get('mimetype')
                imageurl = image.get('imageurl')
                sizes = variation.get('sizes', [])

                cursor.execute("SELECT id FROM variations WHERE productid = %s AND colorid = %s;", (productid, colorid))
                result = cursor.fetchone()
                if result:
                    variationid = result[0]
                else:
                    cursor.execute("""
                        INSERT INTO variations (productid, colorid)
                        VALUES (%s, %s)
                        RETURNING id;
                    """, (productid, colorid))
                    variationid = cursor.fetchone()[0]

                cursor.execute("""
                    INSERT INTO images (productid, variationid, filename, mimetype, imageurl)
                    VALUES (%s, %s, %s, %s, %s);
                """, (productid, variationid, filename, mimetype, imageurl))

                handle_sizes(cursor, variationid, sizes)
    except Exception as e:
        db_conn.rollback()
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