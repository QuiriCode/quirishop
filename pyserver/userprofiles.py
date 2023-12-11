from flask import Blueprint, request, jsonify, current_app
from db import db_conn, ensure_db_connection
import traceback

userprofile_blueprint = Blueprint('userprofiles', __name__)

@userprofile_blueprint.route('/userprofiles', methods=['GET'])
def get_userprofile():
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT * FROM userprofile ORDER BY id")
            profile_records = cursor.fetchall()

        profiles = []
        for profile_record in profile_records:
            profile_id, name = profile_record
            profile = {
                'id': profile_id,
                'name': name
            }
            profiles.append(profile)
        return jsonify(profiles=profiles), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

@userprofile_blueprint.route('/userprofiles', methods=['POST'])
def add_userprofile():
    data = request.get_json()
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("INSERT INTO userprofile (name) VALUES (%s) RETURNING id;", 
                           (data['name'],))
            profile_id = cursor.fetchone()[0]
            db_conn.commit()
            return jsonify(id=profile_id), 201
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

@userprofile_blueprint.route('/userprofiles/<int:id>', methods=['PUT'])
def update_userprofile(id):
    data = request.get_json()
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("UPDATE userprofile SET name = %s WHERE id = %s;", 
                           (data['name'], id))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

@userprofile_blueprint.route('/userprofiles/<int:id>', methods=['DELETE'])
def delete_userprofile(id):
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("DELETE FROM userprofile WHERE id = %s;", (id,))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500
