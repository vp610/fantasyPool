import requests
from flask import current_app
from supabase import Client
from app.utility.headers import get_headers

### Helper Functions ###
def fetch_data_from_api(api_url):
    """Fetch data from the external API."""
    response = requests.get(api_url, headers=get_headers())
    if response.status_code == 200:
        return response.json()
    else:
        print(f"API request failed: {response.status_code}", response.json())
        return None

def batch_upsert(supabase, table_name, data, batch_size=100):
    """Batch upsert data into the specified table."""
    for i in range(0, len(data), batch_size):
        batch = data[i:i + batch_size]
        response = supabase.table(table_name).upsert(batch).execute()
        if response.status_code not in (200, 201):
            print(f"Failed to upsert data into {table_name}", response.json())
        else:
            print(f"Upserted {len(batch)} records into {table_name}")

def fetch_table_data(supabase, table_name):
    """Fetch all data from the specified table."""
    print("Fetching data from table:", table_name)
    response = supabase.table(table_name).select("*").execute()
    return response.data or []

def determine_role(player_name):
    """Map player roles to predefined categories."""
    roles = {
        "BATSMEN": "Batsmen",
        "BOWLER": "Bowler",
        "ALL ROUNDER": "All Rounder",
        "WICKET KEEPER": "Wicket Keeper",
    }
    return roles.get(player_name.upper(), "Unknown")

### Cron Job 1: Team and Player Initialization ###
def initialize_teams_and_players(supabase: Client):
    """Check and initialize teams and players in the database."""
    print("######################")
    teams_data = fetch_table_data(supabase, "teams")
    players_data = fetch_table_data(supabase, "players")
    print("######################")

    print("######################")
    print("Cron job 1: Team and Player Initialization")
    print("fetch_table_data(supabase, 'teams'):", teams_data)
    print("fetch_table_data(supabase, 'players'):", players_data)

    if not teams_data or not players_data:
        print("Teams or players data missing, fetching from API...")
        fetch_teams_and_players(supabase)
    else:
        print("Teams and players data already exist in the database.")

def fetch_teams_and_players(supabase: Client):
    """Fetch teams and players from the external API."""
    api_url = f"{current_app.config['ENDPOINT_URL']}/teams/v1/international"
    data = fetch_data_from_api(api_url)

    if data:
        print("Printing team data from api call ", data)
        print("######################")
        teams = [
            {"teamId": team["teamId"], "teamName": team["teamName"]}
            for team in data.get("list", [])[1:]
        ]
        batch_upsert(supabase, "teams", teams)
        for team in teams:
            fetch_players_for_team(supabase, team["teamId"])

def fetch_players_for_team(supabase: Client, team_id):
    """Fetch and store players for a given team."""
    api_url = f"{current_app.config['ENDPOINT_URL']}/teams/v1/{team_id}/players"
    data = fetch_data_from_api(api_url)

    if data:
        print("Printing player data from api call ", data)
        print("######################")
        players = []
        role = 'Batsmen'
        for player in data.get("player", []):
            if not player['id']:
                role = determine_role(player["name"])
            else:
                player = {
                    "playerId": player["id"],
                    "name": player["name"],
                    "teamId": team_id,
                    "role": role,
                }
                players.append(player)
        batch_upsert(supabase, "players", players)

### Cron Job 2: Match Results and Player Performance ###
def update_match_data(supabase: Client):
    """Fetch and update match data from the external API."""
    api_url = f"{current_app.config['ENDPOINT_URL']}/matches/v1/recent"
    data = fetch_data_from_api(api_url)

    if data:
        for match_type in data.get("typeMatches", []):
            if match_type["matchType"] == "International":
                for series_match in match_type.get("seriesMatches", []):
                    process_series_match(supabase, series_match)

def process_series_match(supabase: Client, series_match):
    """Process matches from a given series."""
    matches = series_match.get("seriesAdWrapper", {}).get("matches", [])
    for match in matches:
        match_info = match.get("matchInfo")
        if match_info and match_info["state"] == "Complete":
            update_match_results(supabase, match_info)

def update_match_results(supabase: Client, match_info):
    """Update results for a completed match."""
    match_id = match_info["matchId"]
    team1 = match_info["team1"]
    team2 = match_info["team2"]
    result = match_info["stateTitle"]

    winner_team_id = team1["teamId"] if team1["teamSName"] in result else team2["teamId"]
    loser_team_id = team2["teamId"] if winner_team_id == team1["teamId"] else team1["teamId"]

    update_team_stats(supabase, winner_team_id, loser_team_id)
    update_player_performance(supabase, match_id)

def update_team_stats(supabase: Client, winner_team_id, loser_team_id):
    """Update team statistics."""
    teams = fetch_table_data(supabase, "teams")
    updated_teams = []

    for team in teams:
        if team["teamId"] == winner_team_id:
            team["totalWins"] += 1
        elif team["teamId"] == loser_team_id:
            team["totalLosses"] += 1
        if team["teamId"] in (winner_team_id, loser_team_id):
            team["totalGames"] += 1
        updated_teams.append(team)

    batch_upsert(supabase, "teams", updated_teams)

def update_player_performance(supabase: Client, match_id):
    """Update player performance based on match data."""
    api_url = f"{current_app.config['ENDPOINT_URL']}/mcenter/v1/{match_id}/scard"
    data = fetch_data_from_api(api_url)

    if data and data.get("isMatchComplete"):
        for innings in data.get("scoreCard", []):
            team_id = innings.get("teamId")
            process_team_innings(supabase, innings, team_id)

def process_team_innings(supabase: Client, innings, team_id):
    """Process a team's innings to update player statistics."""
    batsmen = innings.get("batTeamDetails", {}).get("batsmenData", {})
    bowlers = innings.get("bowlTeamDetails", {}).get("bowlersData", {})

    update_batsmen_stats(supabase, batsmen, team_id)
    update_bowlers_stats(supabase, bowlers, team_id)

def update_batsmen_stats(supabase: Client, batsmen, team_id):
    """Update batsmen statistics."""
    players = fetch_table_data(supabase, "players")
    updated_players = []

    for player_id, stats in batsmen.items():
        runs = stats.get("runs", 0)
        player = next((p for p in players if p["playerId"] == int(player_id)), None)

        if player:
            player["numFifties"] += int(50 <= runs < 100)
            player["numHundreds"] += int(runs >= 100)
            updated_players.append(player)

    batch_upsert(supabase, "players", updated_players)

def update_bowlers_stats(supabase: Client, bowlers, team_id):
    """Update bowlers statistics."""
    players = fetch_table_data(supabase, "players")
    updated_players = []

    for player_id, stats in bowlers.items():
        wickets = stats.get("wickets", 0)
        player = next((p for p in players if p["playerId"] == int(player_id)), None)

        if player:
            player["threeWickets"] += int(3 <= wickets < 5)
            player["fiveWickets"] += int(wickets >= 5)
            updated_players.append(player)

    batch_upsert(supabase, "players", updated_players)
