from datetime import datetime
import requests
from flask import current_app
from supabase import Client
from app.utility.headers import get_headers

### Helper Functions ###
def get_sport_id(supabase: Client, sport_name: str):
    """Get the sport ID from the tournaments table."""
    response = supabase.table("sports").select("id").eq("name", sport_name).execute()
    if response.data:
        return response.data[0]["id"]
    else:
        insert_response = supabase.table("sports").insert({"name": sport_name}).execute()
        print(insert_response)
        if insert_response.data:
            return insert_response.data[0]["id"]
        else:
            print(f"Failed to insert sport {sport_name}", insert_response.json())
            return None

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
        if response:
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
        "BATTERS": "Batsmen",
        "BOWLER": "Bowler",
        "BOWLERS": "Bowler",
        "ALL ROUNDER": "All Rounder",
        "ALL ROUNDERS": "All Rounder",
        "WICKET KEEPER": "Wicket Keeper",
        "WICKET KEEPERS": "Wicket Keeper",
    }
    return roles.get(player_name.upper(), "Unknown")

### Cron Job 1: Team and Player Initialization ###
def initialize_teams_and_players(supabase: Client):
    """Check and initialize teams and players in the database."""
    teams_data = fetch_table_data(supabase, "teams")
    players_data = fetch_table_data(supabase, "players")

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
        teams = []
        for team in data['list']:
            if 'teamId' in team:
                teams.append({
                    "name": team["teamName"],
                    "teamId": team["teamId"],
                    "sportId": get_sport_id(supabase, "Cricket")
                })
        batch_upsert(supabase, "teams", teams)
        for team in teams:
            fetch_players_for_team(supabase, team["teamId"])

def fetch_players_for_team(supabase: Client, team_id):
    """Fetch and store players for a given team."""
    api_url = f"{current_app.config['ENDPOINT_URL']}/teams/v1/{team_id}/players"
    data = fetch_data_from_api(api_url)

    team_response = supabase.table("teams").select("id").eq("teamId", str(team_id)).execute()
    if team_response:
        team_uuid = team_response.data[0]["id"]
    else:
        print(f"Failed to retrieve team ID for teamId {team_id}")
        return

    if data:
        players = []
        role = 'Batsmen'
        for player in data.get("player", []):
            if not 'id' in player:
                role = determine_role(player["name"])
            else:
                players.append({
                    "name": player["name"],
                    "teamId": team_uuid,
                    "sportId": get_sport_id(supabase, "Cricket"),
                    "playerId": player["id"],
                    "role": role,
                })
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
    seriesInfo = series_match.get("seriesAdWrapper", {})
    if seriesInfo:
        seriesId = seriesInfo.get("seriesId")
        if seriesId != 9325:
            return
        supabase_response = supabase.table("tournaments").select("id").eq("seriesId", seriesId).execute()
        if supabase_response:
            tournament_id = supabase_response.data[0]["id"]
        else:
            tournament_id = supabase.table("tournaments").insert(
                {
                    "name": series_match['seriesName'], 
                    "seriesId": seriesId, 
                    "startDate": datetime.fromtimestamp(int(seriesInfo["startDt"]) / 1000).isoformat(),
                    "endDate": datetime.fromtimestamp(int(seriesInfo["endDt"]) / 1000).isoformat(),
                    "sportId": supabase.table("sports").select("id").eq("name", "Cricket").execute().data[0]["id"],
                    }).execute()[0]["id"]

    matches = series_match.get("seriesAdWrapper", {}).get("matches", [])
    for match in matches:
        match_info = match.get("matchInfo")
        if match_info and match_info["state"] == "Complete":
            update_match_results(supabase, match_info, tournament_id)

def update_match_results(supabase: Client, match_info, tournament_id):
    """Update results for a completed match."""
    match_id = match_info["matchId"]
    team1 = match_info["team1"]
    team2 = match_info["team2"]
    result = match_info["status"]
    game_tied = False

    if "won" in result:
        winner_team_id = team1["teamId"] if team1["teamName"] in result else team2["teamId"]
        loser_team_id = team2["teamId"] if winner_team_id == team1["teamId"] else team1["teamId"]
    else:
        winner_team_id, loser_team_id = team1["teamId"], team2["teamId"]
        game_tied = True
    
    winner_team_id = supabase.table("teams").select("id").eq("teamId", winner_team_id).execute().data[0]["id"]
    loser_team_id = supabase.table("teams").select("id").eq("teamId", loser_team_id).execute().data[0]["id"]

    update_team_stats(supabase, winner_team_id, loser_team_id, tournament_id, game_tied)
    update_player_performance(supabase, match_id, tournament_id)

def update_team_stats(supabase: Client, winner_team_id, loser_team_id, tournament_id, match_tied=False):
    """Update team statistics."""
    teams = fetch_table_data(supabase, "teamResults")
    if not teams:
        supabase.table("teamResults").insert({"teamId": winner_team_id, "tournamentId": tournament_id}).execute()
        supabase.table("teamResults").insert({"teamId": loser_team_id, "tournamentId": tournament_id}).execute()
   
    supabase_response = supabase.table("teamResults").select("*").eq("tournamentId", str(tournament_id)).execute()
    teams = supabase_response.data
    for team in teams:
        
        if team["teamId"] in (winner_team_id, loser_team_id):
            if match_tied:
                team["totalDraws"] += 1
            elif team["teamId"] == winner_team_id:
                team["totalWins"] += 1
            elif team["teamId"] == loser_team_id:
                team["totalLosses"] += 1
            team["totalGames"] += 1

    batch_upsert(supabase, "teamResults", teams)

def update_player_performance(supabase: Client, match_id, tournament_id):
    """Update player performance based on match data."""
    api_url = f"{current_app.config['ENDPOINT_URL']}/mcenter/v1/{match_id}/scard"
    data = fetch_data_from_api(api_url)

    if data and data.get("isMatchComplete"):
        for innings in data.get("scoreCard", []):
            process_team_innings(supabase, innings, tournament_id)

def process_team_innings(supabase: Client, innings, tournament_id):
    """Process a team's innings to update player statistics."""
    bat_team_id = innings.get("batTeamDetails", {}).get("batTeamId", {})
    bat_team_id = supabase.table("teams").select("id").eq("teamId", bat_team_id).execute().data[0]["id"]
    batsmen = innings.get("batTeamDetails", {}).get("batsmenData", {})
    
    bowl_team_id = innings.get("batTeamDetails", {}).get("bowlTeamId", {})
    bowl_team_id = supabase.table("teams").select("id").eq("teamId", bowl_team_id).execute().data[0]["id"]
    bowlers = innings.get("bowlTeamDetails", {}).get("bowlersData", {})

    update_batsmen_stats(supabase, batsmen, bat_team_id, tournament_id)
    update_bowlers_stats(supabase, bowlers, bowl_team_id, tournament_id)

def update_batsmen_stats(supabase: Client, batsmen, team_id, tournament_id):
    """Update batsmen statistics."""
    sportId = get_sport_id(supabase, "Cricket")

    for player_id, stats in batsmen.items():
        runs = stats.get("runs", 0)
        playerId = stats.get("batId")
        
        player_response = supabase.table("players").select("id").eq("playerId", player_id).execute()
        if not player_response:
            supabase.table("players").insert({"name": stats['batName'], "playerId": playerId, "teamId": team_id, "sportId": sportId}).execute()
            player_response = supabase.table("players").select("id").eq("playerId", player_id).execute()

        player_db_id = player_response.data[0]["id"]
        player_stats_response = supabase.table("playerStatistics").select("id").eq("playerId", player_db_id).eq("tournamentId", tournament_id).execute()
        if not player_stats_response:
            supabase.table("playerStatistics").insert({"playerId": player_db_id, "tournamentId": tournament_id, "sportId": sportId}).execute()
            player_stats_response = supabase.table("playerStatistics").select("id").eq("playerId", player_db_id).eq("tournamentId", tournament_id).execute()
        
        player_stats_db_id = player_stats_response.data[0]["id"]
        player_stats_cricket_response = supabase.table("playerStatsCricket").select("id", "hundreds", "fifties").eq("playerStatsId", player_stats_db_id).execute()
        if not player_stats_cricket_response.data:
            supabase.table("playerStatsCricket").insert({"playerStatsId": player_stats_db_id}).execute()
            player_stats_cricket_response = supabase.table("playerStatsCricket").select("id", "hundreds", "fifties").eq("playerStatsId", player_stats_db_id).execute()

        player_stats_cricket = player_stats_cricket_response.data[0]

        if runs >= 100:
            player_stats_cricket["hundreds"] += 1
        elif runs >= 50:
            player_stats_cricket["fifties"] += 1

        supabase.table("playerStatsCricket").upsert(player_stats_cricket).execute()


def update_bowlers_stats(supabase: Client, bowlers, team_id, tournament_id):
    """Update bowlers statistics."""
    sportId = get_sport_id(supabase, "Cricket")

    for player_id, stats in bowlers.items():
        wickets = stats.get("wickets", 0)
        playerId = stats.get("bowlerId")
        
        player_response = supabase.table("players").select("id").eq("playerId", player_id).execute()
        if not player_response:
            supabase.table("players").insert({"name": stats['bowlName'], "playerId": playerId, "teamId": team_id, "sportId": sportId}).execute()
            player_response = supabase.table("players").select("id").eq("playerId", player_id).execute()

        player_db_id = player_response.data[0]["id"]
        player_stats_response = supabase.table("playerStatistics").select("id").eq("playerId", player_db_id).eq("tournamentId", tournament_id).execute()
        if not player_stats_response:
            supabase.table("playerStatistics").insert({"playerId": player_db_id, "tournamentId": tournament_id, "sportId": sportId}).execute()
            player_stats_response = supabase.table("playerStatistics").select("id").eq("playerId", player_db_id).eq("tournamentId", tournament_id).execute()

        player_stats_db_id = player_stats_response.data[0]["id"]
        player_stats_cricket_response = supabase.table("playerStatsCricket").select("id", "fiveWickets", "threeWickets").eq("playerStatsId", player_stats_db_id).execute()
        if not player_stats_cricket_response:
            supabase.table("playerStatsCricket").insert({"playerStatsId": player_stats_db_id}).execute()
            player_stats_cricket_response = supabase.table("playerStatsCricket").select("id", "fiveWickets", "threeWickets").eq("playerStatsId", player_stats_db_id).execute()
        
        player_stats_cricket = player_stats_cricket_response.data[0]
        if wickets >= 5:
            player_stats_cricket["fiveWickets"] += 1
        elif wickets >= 3:
            player_stats_cricket["threeWickets"] += 1
        supabase.table("playerStatsCricket").upsert(player_stats_cricket).execute()
