from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app import mongo

main = Blueprint('main', __name__)

@main.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Check if user already exists
    user = mongo.db.users.find_one({'username': username})
    if user:
        return jsonify({"error": "User already exists"}), 400

    # Create new user
    password_hash = generate_password_hash(password)
    mongo.db.users.insert_one({
        'username': username,
        'password_hash': password_hash,
        'teams_selected': [],
        'players_selected': [],
        'points': 0
    })

    return jsonify({"message": "User created successfully"}), 201

@main.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = mongo.db.users.find_one({'username': username})
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({"error": "Invalid credentials"}), 400

    # In production, you would return a session token or similar.
    return jsonify({"message": "Login successful"}), 200
