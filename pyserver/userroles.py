from flask import Blueprint, request, jsonify, current_app
from db import db_conn, ensure_db_connection
import traceback

userroles_blueprint = Blueprint('userroles', __name__)

@userroles_blueprint.route('/userroles', methods=['GET'])
def get_userroles():
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT * FROM userroles ORDER BY id")
            roles_records = cursor.fetchall()

        roles = []
        for role_record in roles_records:
            role_id, code, description, flexcolumn = role_record
            role = {
                'id': role_id,
                'code': code,
                'description': description,
                'flexcolumn': flexcolumn
            }
            roles.append(role)
        return jsonify(roles=roles), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

@userroles_blueprint.route('/userroles', methods=['POST'])
def add_userrole():
    data = request.get_json()
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("INSERT INTO userroles (code, description, flexcolumn) VALUES (%s, %s, %s) RETURNING id;", 
                           (data['code'], data['description'], data['flexcolumn']))
            role_id = cursor.fetchone()[0]
            db_conn.commit()
            return jsonify(id=role_id), 201
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

@userroles_blueprint.route('/userroles/<int:id>', methods=['PUT'])
def update_userrole(id):
    data = request.get_json()
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("UPDATE userroles SET code = %s, description = %s, flexcolumn = %s WHERE id = %s;", 
                           (data['code'], data['description'], data['flexcolumn'], id))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

@userroles_blueprint.route('/userroles/<int:id>', methods=['DELETE'])
def delete_userrole(id):
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("DELETE FROM userroles WHERE id = %s;", (id,))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500
