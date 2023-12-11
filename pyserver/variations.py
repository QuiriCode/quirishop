from flask import Blueprint, request, jsonify, current_app, current_app
from db import db_conn, ensure_db_connection
import utilities  # Shared utility functions
import traceback  # Added import

variations_blueprint = Blueprint('variations', __name__)

@variations_blueprint.route('/variations', methods=['GET'])
def get_variations():
    app = current_app
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
