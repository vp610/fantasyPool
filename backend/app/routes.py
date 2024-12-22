from flask import Blueprint, request, jsonify, current_app
import requests
from werkzeug.security import generate_password_hash, check_password_hash
from app.utility.headers import get_headers
from services.supabase_service import SupabaseService

main = Blueprint('main', __name__)
supabase_service = SupabaseService()

@main.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Check if user already exists
    existing_user = supabase_service.fetch_table("users")
    if any(user['username'] == username for user in existing_user):
        return jsonify({"error": "User already exists"}), 400

    # Create new user
    hashed_password = generate_password_hash(password)
    user_data = {"username": username, "password_hash": hashed_password}
    supabase_service.insert_into_table("users", user_data)

    return jsonify({"message": "User created successfully"}), 201

@main.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    users = supabase_service.fetch_table("users")
    user = next((u for u in users if u['username'] == username), None)

    if user is None or not check_password_hash(user['password_hash'], password):
        return jsonify({"error": "Invalid credentials"}), 400

    return jsonify({"message": "Login successful"}), 200

@main.route('/teams', methods=['GET'])
def get_teams():
    teams = supabase_service.fetch_table("teams")
    return jsonify(teams), 200

@main.route('/players', methods=['GET'])
def get_players():
    players = supabase_service.fetch_table("players")
    return jsonify(players), 200

@main.route('/select-teams', methods=['POST'])
def select_teams():
    data = request.json
    username = data.get('username')
    selected_teams = data.get('teams')

    if len(selected_teams) != 3:
        return jsonify({"error": "You must select exactly 3 teams"}), 400

    user = supabase_service.fetch_table("users")
    user = next((u for u in user if u['username'] == username), None)

    if not user:
        return jsonify({"error": "User not found"}), 404

    supabase_service.update_table("users", {"username": username}, {"teams_selected": ",".join(selected_teams)})

    return jsonify({"message": "Teams selected successfully"}), 200



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