from flask import Blueprint, request, jsonify, current_app
from db import db_conn, ensure_db_connection
import traceback  # Added import

categories_blueprint = Blueprint('categories', __name__)

def list_categories():
    app = current_app
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


@categories_blueprint.route('/categories', methods=['GET'])
def get_categories():
    app = current_app
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
    

@categories_blueprint.route('/categories', methods=['POST'])
def add_category():
    app = current_app
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

@categories_blueprint.route('/categories/<int:category_id>', methods=['PUT'])
def update_category(category_id):
    app = current_app
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


@categories_blueprint.route('/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    app = current_app
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("DELETE FROM categories WHERE id = %s;", (category_id,))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500


