from flask import Blueprint, jsonify, current_app
import requests
from app.utility.headers import get_headers
from supabase import create_client, Client
from config import Config

api = Blueprint('api', __name__)

# Initialize Supabase client
supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

@api.route('/users', methods=['GET'])
def get_users():
    response = supabase.table('users').select('*').execute()
    return jsonify(response.data)

@api.route('/players', methods=['GET'])
def get_players():
    response = supabase.table('players').select('*').execute()
    return jsonify(response.data)

@api.route('/pools', methods=['GET'])
def get_pools():
    response = supabase.table('pools').select('*').execute()
    return jsonify(response.data)

@api.route('/teams', methods=['GET'])
def get_teams():
    response = supabase.table('teams').select('*').execute()
    return jsonify(response.data)

#########################################################################################
################################## ENDPOINTS TO API #####################################
#########################################################################################

def fetch_teams():
    api_url = f"{current_app.config['ENDPOINT_URL']}/teams/v1/international"
    response = requests.get(api_url, headers=get_headers())

    # if response.status_code == 200:
    data = response.json()
    return data
    # else:
    #     return jsonify({"error": "Failed to fetch teams"}), 400

def fetch_players_to_db(supabase_service):
    teams = get_teams()
    for team in teams:
        api_url = f"{current_app.config['ENDPOINT_URL']}/teams/v1/{team['teamId']}/players"
        response = requests.get(api_url, headers=get_headers())

        if response.status_code == 200:
            data = response.json()
            for player in data["player"]:
                role = determine_role(player["name"])
                supabase_service.insert_into_table("players", {
                    "name": player["name"],
                    "playerId": player["id"],
                    "role": role,
                    "teamId": team["teamId"],
                    "numFifties": 0,
                    "numHundreds": 0,
                    "threeWickets": 0,
                    "fiveWickets": 0,
                })
    return 0

def determine_role(player_name):
    roles = {
        "BATSMEN": "Batsmen",
        "BOWLER": "Bowler",
        "ALL ROUNDER": "All Rounder",
        "WICKET KEEPER": "Wicket Keeper",
    }
    return roles.get(player_name, "Unknown")