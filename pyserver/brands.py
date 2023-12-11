from flask import Blueprint, request, jsonify, current_app
from db import db_conn, ensure_db_connection
import utilities  # Shared utility functions
import traceback  # Added import

brands_blueprint = Blueprint('brands', __name__)

@brands_blueprint.route('/brands', methods=['GET'])
def get_brands():
    app = current_app
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT * FROM brands")
            brands = [dict((cursor.description[i][0], value) for i, value in enumerate(row)) for row in cursor.fetchall()]
            return jsonify(brands=brands), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

@brands_blueprint.route('/brands', methods=['POST'])
def add_brand():
    app = current_app
    try:
        brand_data = request.get_json()
        with db_conn.cursor() as cursor:
            cursor.execute("INSERT INTO brands (name, redirecturl) VALUES (%s, %s);", 
                           (brand_data['name'], brand_data['redirecturl']))
            db_conn.commit()
            return jsonify(success=True), 201
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

@brands_blueprint.route('/brands/<int:brand_id>', methods=['PUT'])
def update_brand(brand_id):
    app = current_app
    try:
        brand_data = request.get_json()
        with db_conn.cursor() as cursor:
            cursor.execute("UPDATE brands SET name=%s, redirecturl=%s WHERE id=%s;", 
                           (brand_data['name'], brand_data['redirecturl'], brand_id))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

@brands_blueprint.route('/brands/<int:brand_id>', methods=['DELETE'])
def delete_brand(brand_id):
    app = current_app
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("DELETE FROM brands WHERE id=%s;", (brand_id,))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500