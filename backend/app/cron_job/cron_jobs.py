from flask import current_app
from app import db
from app.utility.headers import get_headers
from app.models import Team, Player
import requests

def fetch_match_data(app):
    with app.app_context():  # Use the app instance to push the context
        print("Fetching match data")
        api_url = f"{current_app.config['ENDPOINT_URL']}/matches/v1/recent"
        response = requests.get(api_url, headers=get_headers())
        data = response.json()

        for type_match in data['typeMatches']:
            if type_match["matchType"] == "International":
                series_matches = type_match["seriesMatches"]
                for series_match in series_matches:
                    if "seriesAdWrapper" in series_match:
                        series_ad_wrapper = series_match["seriesAdWrapper"]
                        for match in series_ad_wrapper["matches"]:  
                            if match["matchInfo"]["state"] == "Complete":
                                match_id = match["matchInfo"]["matchId"]
                                team1 = match["matchInfo"]["team1"]
                                team2 = match["matchInfo"]["team2"]
                                result = match["matchInfo"]["stateTitle"]
                                winner_team_id = 0
                                if team1["teamSName"] in result:
                                    winner_team_id = team1["teamId"]
                                else:
                                    winner_team_id = team2["teamId"]

                                team1 = Team.query.filter_by(teamId=team1["teamId"]).first()
                                team2 = Team.query.filter_by(teamId=team2["teamId"]).first()
                                if team1:
                                    team1.totalGames += 1
                                    if team1.teamId == winner_team_id:
                                        team1.totalWins += 1
                                if team2:
                                    team2.totalGames += 1
                                    if team2.teamId == winner_team_id:
                                        team2.totalWins += 1
                                db.session.commit()
                                fetch_player_performance(match_id, team1, team2)


def fetch_player_performance(match_id, team1, team2):
    api_url = f"{current_app.config['ENDPOINT_URL']}/mcenter/v1/{match_id}/scard"
    response = requests.get(api_url, headers=get_headers())
    data = response.json()

    if (data['isMatchComplete'] == False):
        return

    scorecard = data["scoreCard"]

    # Determine which scorecard belongs to which team
    team1Scorecard = scorecard[0] if scorecard[0]['batTeamDetails']['batTeamId'] == team1.teamId else scorecard[1]
    team2Scorecard = scorecard[0] if scorecard[0]['batTeamDetails']['batTeamId'] == team2.teamId else scorecard[1]

    # Process team 1's batting and bowling
    process_team_performance(team1Scorecard, team1.teamId, "Batsmen")
    process_team_performance(team1Scorecard, team1.teamId, "Bowler")

    # Process team 2's batting and bowling
    process_team_performance(team2Scorecard, team2.teamId, "Batsmen")
    process_team_performance(team2Scorecard, team2.teamId, "Bowler")

    # Commit all changes to the database
    db.session.commit()

def process_team_performance(scorecard, teamId, role):
    if role == "Batsman":
        teamBatTeamDetails = scorecard['batTeamDetails']
        batsmenData = teamBatTeamDetails['batsmenData']

        for b in batsmenData:
            batsman = batsmenData[b]
            playerId = batsman['batId']
            runsScored = batsman['runs']
            if runsScored >= 100:
                hundreds = 1
                fifties = 0
            else:
                hundreds = 0
                if runsScored >= 50:
                    fifties = 1
                else:
                    fifties = 0
            
            # Update or create player record
            update_or_create_player(playerId, batsman['batName'], teamId, role, fifties, hundreds, isKeeper=batsman["isKeeper"])

    elif role == "Bowler":
        teamBowlTeamDetails = scorecard['bowlTeamDetails']
        print("++++++++++++++++++++++++++++++++++=====++++++++++++++++++++++++++++++")

        bowlersData = teamBowlTeamDetails['bowlersData']

        for b in bowlersData:
            print("++++++++++++++++++++++++++++++++++=====++++++++++++++++++++++++++++++")
            # print(bowler)
            bowler = bowlersData[b]
            playerId = bowler['bowlerId']
            wickets = bowler['wickets']
            if wickets >= 5:
                fiveWickets = 1
                threeWickets = 0
            else:
                fiveWickets = 0
                if wickets >= 3:
                    threeWickets = 1
                else:
                    threeWickets = 0
            
            # Update or create player record
            update_or_create_player(playerId, bowler['bowlName'], teamId, role, threeWickets, fiveWickets)

def update_or_create_player(playerId, name, teamId, role, stat1, stat2, isKeeper=False):
    # Fetch player from the database
    existing_player = Player.query.filter_by(playerId=playerId).first()

    if existing_player:
        # Update existing player's stats based on role
        if role == "Batsmen":
            existing_player.numFifties += stat1
            existing_player.numHundreds += stat2
        elif role == "Bowler":
            existing_player.threeWickets += stat1
            existing_player.fiveWickets += stat2
        existing_player.teamId = teamId  # Ensure the correct teamId is set
    else:
        # Create a new player record
        ############ what if the player is an all rounder or a wicket keeper but appears in "batsmen" or "bowler" category for the scorecard how to handle that ############

        if role == "Batsmen":
            new_player = Player(
                teamId=teamId,
                playerId=playerId,
                name=name,
                role=role if not isKeeper else "Wicket Keeper",
                numFifties=stat1,
                numHundreds=stat2
            )
        elif role == "Bowler":
            new_player = Player(
                teamId=teamId,
                playerId=playerId,
                name=name,
                role=role,
                threeWickets=stat1,
                fiveWickets=stat2
            )
        db.session.add(new_player)
        db.session.commit()
