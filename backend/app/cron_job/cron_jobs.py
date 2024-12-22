import requests
from flask import current_app
from app.utility.headers import get_headers

def fetch_match_data(supabase_service):
    print("Fetching match data")
    api_url = f"{current_app.config['ENDPOINT_URL']}/matches/v1/recent"
    response = requests.get(api_url, headers=get_headers())
    data = response.json()

    for type_match in data['typeMatches']:
        if type_match["matchType"] == "International":
            for series_match in type_match["seriesMatches"]:
                if "seriesAdWrapper" in series_match:
                    for match in series_match["seriesAdWrapper"]["matches"]:
                        if match["matchInfo"]["state"] == "Complete":
                            match_id = match["matchInfo"]["matchId"]
                            team1 = match["matchInfo"]["team1"]
                            team2 = match["matchInfo"]["team2"]
                            result = match["matchInfo"]["stateTitle"]

                            winner_team_id = team1["teamId"] if team1["teamSName"] in result else team2["teamId"]
                            loser_team_id = team2["teamId"] if team1["teamSName"] in result else team1["teamId"]

                            # Update teams in Supabase
                            teams = supabase_service.fetch_table("teams")
                            for team in teams:
                                if team["teamId"] == winner_team_id:
                                    team["totalWins"] += 1
                                    team["totalGames"] += 1
                                elif team["teamId"] == loser_team_id:
                                    team["totalGames"] += 1
                            supabase_service.update_table("teams", {}, teams)

                            fetch_player_performance(supabase_service, match_id, team1, team2)


def fetch_player_performance(supabase_service, match_id, team1, team2):
    api_url = f"{current_app.config['ENDPOINT_URL']}/mcenter/v1/{match_id}/scard"
    response = requests.get(api_url, headers=get_headers())
    data = response.json()

    if not data.get('isMatchComplete', False):
        return

    scorecard = data["scoreCard"]
    team1_scorecard = scorecard[0] if scorecard[0]['batTeamDetails']['batTeamId'] == team1["teamId"] else scorecard[1]
    team2_scorecard = scorecard[0] if scorecard[0]['batTeamDetails']['batTeamId'] == team2["teamId"] else scorecard[1]

    process_team_performance(supabase_service, team1_scorecard, team1["teamId"], "Batsmen")
    process_team_performance(supabase_service, team1_scorecard, team1["teamId"], "Bowler")
    process_team_performance(supabase_service, team2_scorecard, team2["teamId"], "Batsmen")
    process_team_performance(supabase_service, team2_scorecard, team2["teamId"], "Bowler")


def process_team_performance(supabase_service, scorecard, team_id, role):
    if role == "Batsmen":
        batsmen_data = scorecard['batTeamDetails']['batsmenData']
        for player_id, batsman in batsmen_data.items():
            runs_scored = batsman['runs']
            fifties = 1 if 50 <= runs_scored < 100 else 0
            hundreds = 1 if runs_scored >= 100 else 0

            update_or_create_player(supabase_service, player_id, batsman['batName'], team_id, role, fifties, hundreds, batsman.get("isKeeper", False))
    elif role == "Bowler":
        bowlers_data = scorecard['bowlTeamDetails']['bowlersData']
        for player_id, bowler in bowlers_data.items():
            wickets = bowler['wickets']
            three_wickets = 1 if 3 <= wickets < 5 else 0
            five_wickets = 1 if wickets >= 5 else 0

            update_or_create_player(supabase_service, player_id, bowler['bowlName'], team_id, role, three_wickets, five_wickets)


def update_or_create_player(supabase_service, player_id, name, team_id, role, stat1, stat2, is_keeper=False):
    players = supabase_service.fetch_table("players")
    existing_player = next((player for player in players if player["playerId"] == player_id), None)

    if existing_player:
        if role == "Batsmen":
            existing_player["numFifties"] += stat1
            existing_player["numHundreds"] += stat2
        elif role == "Bowler":
            existing_player["threeWickets"] += stat1
            existing_player["fiveWickets"] += stat2
        existing_player["teamId"] = team_id
        supabase_service.update_table("players", {"playerId": player_id}, existing_player)
    else:
        new_player = {
            "playerId": player_id,
            "name": name,
            "teamId": team_id,
            "role": role if not is_keeper else "Wicket Keeper",
            "numFifties": stat1 if role == "Batsmen" else 0,
            "numHundreds": stat2 if role == "Batsmen" else 0,
            "threeWickets": stat1 if role == "Bowler" else 0,
            "fiveWickets": stat2 if role == "Bowler" else 0,
        }
        supabase_service.insert_into_table("players", new_player)
