from flask import Blueprint, jsonify, current_app, request
import requests
from app.utility.headers import get_headers
from supabase import create_client, Client
from config import Config

profile_api = Blueprint('profile_api', __name__)

# Initialize Supabase client
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

@profile_api.route('/<authId>', methods=['GET'])
def get_user_by_authid(authId):
    try:
        response = supabase.table('users').select('*').eq("authId", authId).execute()
        print("Supabase response:", response.data)
        if response.data:
            return jsonify(response.data[0])
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        print("Error querying Supabase:", e)
        return jsonify({"error": str(e)}), 500

@profile_api.route('/update/<userId>', methods=['PUT'])
def update_user(userId):
    try:
        response = supabase.table('users').update({"username": request.json.get("username")}).eq("id", userId).execute()
        print("Supabase response:", response.data)
        if response.data:
            return jsonify(response.data[0])
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        print("Error querying Supabase:", e)
        return jsonify({"error": str(e)}), 500
    
