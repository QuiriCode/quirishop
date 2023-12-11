from flask import Flask, request, jsonify
import logging
import traceback
from flask_cors import CORS
from werkzeug.utils import secure_filename
import psycopg2
import os
import re
import sys
import requests
import time
import datetime
from products import products_blueprint
from app_settings import settings_blueprint
from highlights import highlights_blueprint
from categories import categories_blueprint
from tags import tags_blueprint
from variations import variations_blueprint
from brands import brands_blueprint
from userprofiles import userprofile_blueprint
from userprofileroles import userprofileroles_blueprint
from userroles import userroles_blueprint
from cargocarriers import cargocarriers_blueprint
from colors import colors_blueprint
from utilities import create_upload_folder_if_not_exists,create_thumbnail
from db import db_conn, ensure_db_connection


app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Örneğin 16 MB olarak ayarlayın
app.config['UPLOAD_FOLDER'] = '/upload'
UPLOAD_PATH = app.config['UPLOAD_FOLDER']
IMAGES_PATH = os.path.join(UPLOAD_PATH,'/images')
THUMBNAILS_PATH = os.path.join(UPLOAD_PATH,'/thumbnails')

logging.basicConfig(level=logging.INFO)
CORS(app, resources={r"/api/*": {"origins": ["https://quiri.shop", "http://localhost:3000"]}})

app.register_blueprint(colors_blueprint, url_prefix='/api')
app.register_blueprint(products_blueprint, url_prefix='/api')
app.register_blueprint(settings_blueprint, url_prefix='/api')
app.register_blueprint(highlights_blueprint, url_prefix='/api')
app.register_blueprint(categories_blueprint, url_prefix='/api')
app.register_blueprint(tags_blueprint, url_prefix='/api')
app.register_blueprint(variations_blueprint, url_prefix='/api')
app.register_blueprint(brands_blueprint, url_prefix='/api')
app.register_blueprint(userprofile_blueprint, url_prefix='/api')
app.register_blueprint(userprofileroles_blueprint, url_prefix='/api')
app.register_blueprint(userroles_blueprint, url_prefix='/api')
app.register_blueprint(cargocarriers_blueprint, url_prefix='/api')

@app.before_request
def log_request_info():
    global db_conn
    app.logger.info('Headers: %s', request.headers)
    app.logger.info('Body: %s', request.get_data())
    db_conn = ensure_db_connection(db_conn)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    folder_path = IMAGES_PATH
    if 'file' not in request.files:
        return jsonify(error='No file part'), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify(error='No selected file'), 400
    if file:
        # Zaman damgası ile dosya adını benzersiz hale getir
        filename = secure_filename(f"{int(time.time())}_{file.filename}")
        file_path = os.path.join(folder_path, filename)
        file.save(file_path)
        thumbnail_folder = THUMBNAILS_PATH
        thumbnail_filename = os.path.basename(filename)
        thumbnail_path = os.path.join(thumbnail_folder, thumbnail_filename)
        create_thumbnail(file_path, thumbnail_path)

        return jsonify({"imageurl":file_path,"thumbnailurl":thumbnail_path}), 201


if __name__ == '__main__':
    handler = logging.FileHandler('app.log')  # Logları app.log dosyasına yaz
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)
    create_upload_folder_if_not_exists(UPLOAD_PATH)
    create_upload_folder_if_not_exists(IMAGES_PATH)
    create_upload_folder_if_not_exists(THUMBNAILS_PATH)
    app.run(port=5000)

