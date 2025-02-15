from flask import Blueprint, jsonify, current_app, request
import json
import requests
from app.utility.headers import get_headers
from supabase import create_client, Client
from config import Config

dashboard_api = Blueprint('dashboard_api', __name__)

# Initialize Supabase client
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

@dashboard_api.route('/tournaments/<authId>', methods=['GET'])
def get_tournaments(authId):
    try:
        userPools_response = get_user_pools(authId)
        userPools_decoded = json.loads(userPools_response.data.decode('utf-8'))
        userPools = [item['pools']['tournamentId'] for item in userPools_decoded]

        resTournaments = supabase.table('tournaments').select('*').execute()
        resSports = supabase.table('sports').select('*').execute()

        sportData = { }
        for sport in resSports.data:
            sportData[sport['id']] = sport['name']

        tournamentData = {}
        for tournament in resTournaments.data:
            sportName = sportData[tournament['sportId']]
            if sportName not in tournamentData:
                tournamentData[sportName] = []
            if tournament['id'] not in userPools:
                tournamentData[sportName].append(tournament)
            
        return jsonify(tournamentData)
    except Exception as e:
        print("Error querying Supabase:", e)
        return jsonify({"error": str(e)}), 500
    
@dashboard_api.route('/pools/<authId>', methods=['GET'])
def get_user_pools(authId):
    try:
        user = supabase.table('users').select('id').eq('authId', authId).execute()
        if not user.data:
            print(user)
            return jsonify({"error": "User not found"}), 404

        userId = user.data[0]['id']
        response = supabase.from_('userPools') \
            .select('pools(*)') \
            .eq('userId', userId) \
            .execute()
        return jsonify(response.data)
    except Exception as e:
        print("Error querying Supabase:", e)
        return jsonify({"error": str(e)}), 500