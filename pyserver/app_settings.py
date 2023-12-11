from flask import Blueprint, request, jsonify, current_app
from db import db_conn, ensure_db_connection
import traceback  # Added import
import utilities  # Shared utility functions
settings_blueprint = Blueprint('settings', __name__)


@settings_blueprint.route('/appsettings-for-use', methods=['GET'])
def get_appsettings_for_use():
    app = current_app
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT * FROM appsettings")
            appsettings = {row[1]: row[2] for row in cursor.fetchall()}
            return jsonify(appsettings=appsettings), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

@settings_blueprint.route('/appsettings', methods=['GET'])
def get_appsettings():
    app = current_app
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT settingkey,settingvalue FROM appsettings")
            appsettings = []
            for settingkey,settingvalue in cursor.fetchall():
                appsettings.append({"settingkey":settingkey,"settingvalue":settingvalue})
            return jsonify(appsettings=appsettings), 200
    except Exception as e:
        return jsonify(error=str(e)), 500


@settings_blueprint.route('/appsettings', methods=['POST'])
def add_appsetting():
    app = current_app
    try:
        data = request.get_json()
        with db_conn.cursor() as cursor:
            cursor.execute("INSERT INTO appsettings (settingkey, settingvalue) VALUES (%s, %s);", (data['settingkey'], data['settingvalue']))
            db_conn.commit()
            return jsonify(success=True), 201
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

@settings_blueprint.route('/appsettings/<settingkey>', methods=['PUT'])
def update_appsetting(settingkey):
    app = current_app
    try:
        data = request.get_json()
        with db_conn.cursor() as cursor:
            cursor.execute("UPDATE appsettings SET settingvalue = %s WHERE settingkey = %s;", (data['settingvalue'], settingkey))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

@settings_blueprint.route('/appsettings/<settingkey>', methods=['DELETE'])
def delete_appsetting(settingkey):
    app = current_app
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("DELETE FROM appsettings WHERE settingkey = %s;", (settingkey,))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500
