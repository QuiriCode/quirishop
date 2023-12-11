from flask import Blueprint, request, jsonify, current_app
from db import db_conn, ensure_db_connection
import utilities  # Shared utility functions
import traceback  # Added import

tags_blueprint = Blueprint('tags', __name__)

@tags_blueprint.route('/tags', methods=['GET'])
def get_tags():
    app = current_app
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


@tags_blueprint.route('/tags', methods=['POST'])
def add_tag():
    app = current_app
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

@tags_blueprint.route('/tags/<int:tag_id>', methods=['PUT'])
def update_tag(tag_id):
    app = current_app
    try:
        data = request.get_json()
        with db_conn.cursor() as cursor:
            cursor.execute("UPDATE tags SET name = %s WHERE id = %s;", (data['name'], tag_id))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

@tags_blueprint.route('/tags/<int:tag_id>', methods=['DELETE'])
def delete_tag(tag_id):
    app = current_app
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("DELETE FROM tags WHERE id = %s;", (tag_id,))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500