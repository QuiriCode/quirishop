from flask import Blueprint, request, jsonify
from db import db_conn, ensure_db_connection

userprofileroles_blueprint = Blueprint('userprofileroles', __name__)

@userprofileroles_blueprint.route('/userprofileroles', methods=['GET'])
def get_userprofileroles():
    ensure_db_connection()
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT * FROM userprofileroles ORDER BY id")
            roles = cursor.fetchall()
            return jsonify([{'id': row[0], 'userprofileid': row[1], 'roleid': row[2], 'allowedyn': row[3]} for row in roles]), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

@userprofileroles_blueprint.route('/userprofileroles', methods=['POST'])
def add_userprofilerole():
    ensure_db_connection()
    data = request.get_json()
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("INSERT INTO userprofileroles (userprofileid, roleid, allowedyn) VALUES (%s, %s, %s) RETURNING id;", 
                           (data['userprofileid'], data['roleid'], data['allowedyn']))
            role_id = cursor.fetchone()[0]
            db_conn.commit()
            return jsonify(id=role_id), 201
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

@userprofileroles_blueprint.route('/userprofileroles/<int:id>', methods=['PUT'])
def update_userprofilerole(id):
    ensure_db_connection()
    data = request.get_json()
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("UPDATE userprofileroles SET userprofileid = %s, roleid = %s, allowedyn = %s WHERE id = %s;", 
                           (data['userprofileid'], data['roleid'], data['allowedyn'], id))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

@userprofileroles_blueprint.route('/userprofileroles/<int:id>', methods=['DELETE'])
def delete_userprofilerole(id):
    ensure_db_connection()
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("DELETE FROM userprofileroles WHERE id = %s;", (id,))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500
