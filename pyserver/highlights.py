from flask import Blueprint, request, jsonify, current_app
from db import db_conn, ensure_db_connection
import utilities  # Shared utility functions
import traceback  # Added import

highlights_blueprint = Blueprint('highlights', __name__)

@highlights_blueprint.route('/highlights', methods=['POST'])
def add_highlight():
    app = current_app
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


@highlights_blueprint.route('/highlights/<int:highlight_id>', methods=['PUT'])
def update_highlight(highlight_id):
    app = current_app
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

@highlights_blueprint.route('/highlights/<int:highlight_id>', methods=['DELETE'])
def delete_highlight(highlight_id):
    app = current_app
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("DELETE FROM highlights WHERE id = %s;", (highlight_id,))
            db_conn.commit()
            return jsonify(success='Highlight deleted successfully.'), 200
    except Exception as e:
        error_message = f'Error in api: delete_highlight: {e}'
        app.logger.error(error_message)
        return jsonify(error=error_message), 500

@highlights_blueprint.route('/highlights', methods=['GET'])
def get_highlights():
    app = current_app
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
