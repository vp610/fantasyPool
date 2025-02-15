from flask import Blueprint, jsonify, current_app, request
import requests
from app.utility.headers import get_headers
from supabase import create_client, Client
from config import Config
from flask_cors import cross_origin

tournament_api = Blueprint('tournament_api', __name__)

# Initialize Supabase client
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
    
@tournament_api.route('/pools/<tournamentId>', methods=['GET'])
def get_user_pools(tournamentId):
    try:
        res = supabase.table('pools').select('*').eq('tournamentId', tournamentId).execute()
        return jsonify(res.data)
    except Exception as e:
        print("Error querying Supabase:", e)
        return jsonify({"error": str(e)}), 500
    