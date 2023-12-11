from flask import Blueprint, request, jsonify, current_app
from db import db_conn, ensure_db_connection
import traceback

cargocarriers_blueprint = Blueprint('cargocarriers', __name__)

@cargocarriers_blueprint.route('/cargocarriers', methods=['GET'])
def get_cargocarriers():
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("SELECT * FROM cargocarrier ORDER BY id")
            carriers_records = cursor.fetchall()

        carriers = []
        for carrier_record in carriers_records:
            carrier_id, name, phone, iconimageid, logoimageid, addressid = carrier_record
            carrier = {
                'id': carrier_id,
                'name': name,
                'phone': phone,
                'iconimageid': iconimageid,
                'logoimageid': logoimageid,
                'addressid': addressid
            }
            carriers.append(carrier)
        return jsonify(carriers=carriers), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

@cargocarriers_blueprint.route('/cargocarriers', methods=['POST'])
def add_cargocarrier():
    data = request.get_json()
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("INSERT INTO cargocarriers (name, phone, iconimageid, logoimageid, addressid) VALUES (%s, %s, %s, %s, %s) RETURNING id;", 
                           (data['name'], data['phone'], data['iconimageid'], data['logoimageid'], data['addressid']))
            carrier_id = cursor.fetchone()[0]
            db_conn.commit()
            return jsonify(id=carrier_id), 201
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

@cargocarriers_blueprint.route('/cargocarriers/<int:id>', methods=['PUT'])
def update_cargocarrier(id):
    data = request.get_json()
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("UPDATE cargocarriers SET name = %s, phone = %s, iconimageid = %s, logoimageid = %s, addressid = %s WHERE id = %s;", 
                           (data['name'], data['phone'], data['iconimageid'], data['logoimageid'], data['addressid'], id))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500

@cargocarriers_blueprint.route('/cargocarriers/<int:id>', methods=['DELETE'])
def delete_cargocarrier(id):
    try:
        with db_conn.cursor() as cursor:
            cursor.execute("DELETE FROM cargocarriers WHERE id = %s;", (id,))
            db_conn.commit()
            return jsonify(success=True), 200
    except Exception as e:
        db_conn.rollback()
        return jsonify(error=str(e)), 500
