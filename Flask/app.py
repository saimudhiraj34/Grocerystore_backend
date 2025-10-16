# === Flask ===
from flask import Flask, request, jsonify
import cv2
import numpy as np
import pymongo
from flask_cors import CORS
import bcrypt
import base64
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

mongo_uri = os.getenv("MONGO_URI")

client = pymongo.MongoClient(mongo_uri)
db = client["Grocerystore"]
user_collection = db["users"]

def extract_face(image_np):
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    if len(faces) == 0:
        return None
    (x, y, w, h) = faces[0]
    return gray[y:y+h, x:x+w]

def image_to_np_array(image_file):
    file_bytes = np.frombuffer(image_file.read(), np.uint8)
    return cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

@app.route('/register', methods=['POST'])
def register():
    file = request.files['image']
    username = request.form['username']
    password = request.form['password']
    phonenumber=request.form['phonenumber']
    shopname=request.form['shopname']
    address=request.form['address']
    # file = request.files['file'] 
    # print(f"Uploaded Image: {file.filename}")
    # print(f"Uploaded File: {upload_file.filename}")
    
    image_np = image_to_np_array(file)
    
    face = extract_face(image_np)
    # if 'file' not in request.files:
    #     return jsonify({"message": "No file part"}), 400
    # file = request.files['file']

    if face is None:
        return jsonify({"message": "No face found"}), 400

    if user_collection.find_one({"username": username}):
        return jsonify({"message": "User already exists"}), 400

    face_resized = cv2.resize(face, (100, 100))
    face_encoding = normalize_encoding(face_resized.flatten()).tolist()    
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    base64_hash = base64.b64encode(hashed_password).decode('utf-8')
    
    # file.seek(0)
    # image_data = file.read()
    # content_type = file.content_type

    user_collection.insert_one({
        "username": username,
        "password": base64_hash,
        "phonenumber":phonenumber,
        "encoding": face_encoding,
        "shopname":shopname,
        "address":address
        # "file": {
        #     "data": image_data,
        #     "contentType": content_type
        # }
    })

    return jsonify({"message": "User registered successfully"})

import numpy as np

def normalize_encoding(encoding):
    encoding = np.array(encoding, dtype=np.float32)
    norm = np.linalg.norm(encoding)
    return encoding / norm if norm != 0 else encoding

@app.route('/verify_face', methods=['POST'])
def verify_face():
    file = request.files['image']
    phone_number = request.form.get('phonenumber')

    if not phone_number:
        return jsonify({"message": "Phone number is required"}), 400

    user = user_collection.find_one({"phonenumber": phone_number})
    if not user:
        return jsonify({"message": "No user found with that phone number"}), 404

    image_np = image_to_np_array(file)
    face = extract_face(image_np)

    if face is None:
        return jsonify({"message": "No face found"}), 400

    face_resized = cv2.resize(face, (100, 100))
    face_encoding = normalize_encoding(face_resized.flatten())

    stored_encoding = normalize_encoding(np.array(user['encoding'], dtype=np.float32))
    dist = np.linalg.norm(face_encoding - stored_encoding)

    print(f"Distance from {user['username']}: {dist}")

    if dist < 0.6:
        return jsonify({
            "message": "Face and phone number verified successfully",
            "username": user["username"]
        }), 200

    return jsonify({"message": "Face did not match for this phone number"}), 400



if __name__ == '__main__':
    app.run(port=5000, debug=True)
