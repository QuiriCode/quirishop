import os
from PIL import Image

def create_upload_folder_if_not_exists(folder_path):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
        print(f"Created directory: {folder_path}")
    else:
        print(f"Directory already exists: {folder_path}")

def create_thumbnail(image_path, thumbnail_path, size=(128, 128)):
    with Image.open(image_path) as img:
        img.thumbnail(size)
        img.save(thumbnail_path)