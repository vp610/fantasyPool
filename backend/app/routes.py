from flask import Blueprint, request, jsonify, current_app
from app.models import Player, Team, User
from app import db
import requests

main = Blueprint('main', __name__)

#########################################################################################
################################### Utility functions ###################################
#########################################################################################

def get_headers():
    return {
        'x-rapidapi-key': current_app.config['X_RAPIDAPI_KEY'],
        'x-rapidapi-host': current_app.config['X_RAPIDAPI_HOST']
    }


#########################################################################################
################################# Authentication Routes #################################
#########################################################################################

@main.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Check if user already exists
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "User already exists"}), 400

    # Create new user
    user = User(username=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201

@main.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user is None or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 400

    # In production, return a session token or similar
    return jsonify({"message": "Login successful"}), 200

#########################################################################################
########################### Teams & Players selection Routes ############################
#########################################################################################

# This route fetches the list of teams from the database
@main.route('/teams', methods=['GET'])
def get_teams():
    teams = Team.query.all()
    
    if teams:
        team_names = [{"name": team.name, "teamId": team.teamId} for team in teams]
        return jsonify(team_names), 200
    else:
        # If not found, fetch from the API
        data = fetch_teams()
        # if data.get('status_code') == 200:
            # Store teams in the database and return them
        print("DATA:", data)
        for team_data in data['list']:
            print(team_data)
            if team_data['teamName'] not in ["Test Teams", "Associate Teams"]:
                team = Team(name=team_data['teamName'], teamId=team_data['teamId'])
                db.session.add(team)
        db.session.commit()

        teams = Team.query.all()
        team_names = [team for team in teams]
        return jsonify(team_names), 200
        # else:
        #     return jsonify({"error": "Failed to fetch teams"}), 500


# This route fetches the list of players from the database
@main.route('/players', methods=['GET'])
def get_players():
    players = Player.query.all()
    
    if players:
        player_names = [player.name for player in players]
        return jsonify(player_names), 200
    else:
        # If not found, fetch from the API
        data = fetch_players_to_db()
        if data != 1:
            players = Player.query.all()
            player_names = [player for player in players]
            return jsonify(player_names), 200
        else:
            return jsonify({"error": "Failed to fetch players"}), 500


# This route recieves the list of teams and players selected by the user
@main.route('/select-teams', methods=['POST'])
def select_teams():
    data = request.json
    username = data.get('username')
    selected_teams = data.get('teams')

    # Validate that 3 teams are selected
    if len(selected_teams) != 3:
        return jsonify({"error": "You must select exactly 3 teams"}), 400

    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    # Store the selected teams as a comma-separated string in the database
    user.teams_selected = ','.join(selected_teams)
    db.session.commit()

    return jsonify({"message": "Teams selected successfully"}), 200


# This route recieves the list of players selected by the user
@main.route('/select-players', methods=['POST'])
def select_players():
    data = request.json
    username = data.get('username')
    selected_players = data.get('players')

    # Validate that 4 players are selected
    if len(selected_players) != 4:
        return jsonify({"error": "You must select exactly 4 players"}), 400

    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    # Store the selected players as a comma-separated string in the database
    user.players_selected = ','.join(selected_players)
    db.session.commit()

    return jsonify({"message": "Players selected successfully"}), 200



#########################################################################################
################################## ENDPOINTS TO API #####################################
#########################################################################################



def fetch_teams():
    api_url = f"{current_app.config['ENDPOINT_URL']}/teams/v1/international"
    headers = get_headers()
    print(headers)
    response = requests.get(api_url, headers=get_headers())
    print(response)
    # if response.status_code == 200:
    data = response.json()
    return data
    # else:
    #     return jsonify({"error": "Failed to fetch teams"}), 400

def fetch_players_to_db():
    teams_response = get_teams()
    teams = teams_response.get_json()  # Use get_json() to parse the response

    for team in teams:
        api_url = f"{current_app.config['ENDPOINT_URL']}/teams/v1/{team['teamId']}/players"
        response = requests.get(api_url, headers=get_headers())
        
        if response.status_code == 200:
            data = response.json()
            for player in data["player"]:
                role = ""
                if player["name"] == "BATSMEN":
                    role = "Batsmen"
                elif player["name"] == "BOWLER":
                    role = "Bowler"
                elif player["name"] == "ALL-ROUNDER":
                    role = "All-Rounder"
                else:
                    new_player = Player(name=player["name"], playerId=player["id"], role=role, teamId=team['teamId'])
                    db.session.add(new_player)
        else:
            return 1
        
    db.session.commit()
    return 0