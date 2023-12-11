from flask import Blueprint, request, jsonify, current_app
from db import db_conn, ensure_db_connection
import traceback

colors_blueprint = Blueprint('colors', __name__)

@colors_blueprint.route('/colors', methods=['GET'])
def get_colors():
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT * FROM colors")
            colors = [dict((cursor.description[i][0], value) for i, value in enumerate(row)) for row in cursor.fetchall()]
            return jsonify(colors=colors), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

@colors_blueprint.route('/colors', methods=['POST'])
def add_color():
    try:
        color_data = request.get_json()
        with db_conn.cursor() as cursor:
            cursor.execute("INSERT INTO colors (name, red, green, blue, hex) VALUES (%s, %s, %s, %s, %s);",
                           (color_data['name'], color_data['red'], color_data['green'], color_data['blue'], color_data['hex']))
            db_conn.commit()
            return jsonify(success=True), 201
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

@colors_blueprint.route('/colors/<int:color_id>', methods=['PUT'])
def update_color(color_id):
    try:
        color_data = request.get_json()
        with db_conn.cursor() as cursor:
            cursor.execute("UPDATE colors SET name=%s, red=%s, green=%s, blue=%s, hex=%s WHERE id=%s;", 
                           (color_data['name'], color_data['red'], color_data['green'], color_data['blue'], color_data['hex'], color_id))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

@colors_blueprint.route('/colors/<int:color_id>', methods=['DELETE'])
def delete_color(color_id):
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("DELETE FROM colors WHERE id=%s;", (color_id,))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500
