import argparse
from apscheduler.schedulers.background import BackgroundScheduler
import time
import requests
from app import create_app
from flask import current_app
from supabase import Client, create_client
from app.utility.headers import get_headers

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

def populate_tournamentTeams(supabase, seriesId):
    print("Running populate_tournamentTeams job...")

    api_url = f"{current_app.config['ENDPOINT_URL']}/series/v1/{seriesId}/squads"
    tournamentId = supabase.table('tournaments').select('id')\
        .eq("seriesId", seriesId).execute().data[0]['id']
    response = requests.get(api_url, headers=get_headers())

    sportId = get_sport_id(supabase, "Cricket")

    if response.status_code == 200:
        print("API request successful.")
        data = response.json()
        teams = data.get('squads')
        print("Teams:", teams)
        for team in teams[1:]:
            resTeamId = team.get('teamId')
            team_query = supabase.table('teams').select('id')\
                .eq("teamId", resTeamId).execute()
            
            if team_query.data:
                teamId = team_query.data[0]['id']
            else:
                team_response = supabase.table('teams').insert([{"teamId": resTeamId, "name": team.get('squadType'), "sportId": sportId}]).execute()
                teamId = team_response.data[0]['id']
            supabase.table('tournamentTeams').insert([{"teamId": teamId, "tournamentId": tournamentId, "squadId": team.get('squadId')}]).execute()
            supabase.table('teamResults').insert([{"teamId": teamId, "tournamentId": tournamentId}]).execute()
        print("Tournament teams populated successfully.")
        return None
    else:
        print(f"API request failed: {response.status_code}", response.json())
        return None

def populate_tournamentPlayers(supabase, seriesId):
    print("Running populate_tournamentPlayers job...")
    tournamentId = supabase.table('tournaments').select('id').eq("seriesId", seriesId).execute().data[0]['id']
    tournamentTeams = supabase.table('tournamentTeams').select('*').eq("tournamentId", tournamentId).execute().data
    sportId = get_sport_id(supabase, "Cricket")
    
    for team in tournamentTeams:
        teamId = team['teamId']
        api_url = f"{current_app.config['ENDPOINT_URL']}/series/v1/{seriesId}/squads/{team['squadId']}"
        response = requests.get(api_url, headers=get_headers())
        if response.status_code == 200:
            print("API request successful.")
            data = response.json()
            players = data.get('player')
            print("Teams:", players)
            for player in data.get("player", []):
                if not 'id' in player:
                    role = determine_role(player["name"])
                else:
                    player_query = supabase.table('players').select('id').eq("playerId", player["id"]).execute()
                    if len(player_query.data) == 0:
                        insert_response = supabase.table('players').insert([
                            {
                            "name": player["name"], 
                            "teamId": teamId, 
                            "playerId": player["id"], 
                            "sportId": sportId, 
                            "role": role}
                            ]).execute()
                        
                    playerId = supabase.table('players').select('id').eq("playerId", player["id"]).execute().data[0]['id']
                    tp_query = supabase.table('tournamentPlayers').select('playerId').eq("playerId", playerId).eq("teamId", teamId).eq("tournamentId", tournamentId).execute()
                    if not tp_query.data:  
                        supabase.table('tournamentPlayers').insert([
                            {"playerId": playerId, "teamId": teamId, "tournamentId": tournamentId}
                        ]).execute()
                        
                        supabase.table('playerStatistics').insert([
                            {"playerId": playerId, "tournamentId": tournamentId, "sportId": sportId}
                        ]).execute()
                        
                        playerStatsId = supabase.table('playerStatistics').select('id').eq("playerId", playerId).eq("tournamentId", tournamentId).eq("sportId", sportId).execute().data[0]['id']
                        supabase.table('playerStatsCricket').insert([
                            {"playerStatsId": playerStatsId}
                        ]).execute()


    print("Tournament players populated successfully.")
    return None


def main():
    app = create_app()
    
    with app.app_context():  # Ensure app context is active
        supabase: Client = create_client(app.config['SUPABASE_URL'], app.config['SUPABASE_KEY'])

    parser = argparse.ArgumentParser(description="Run cron jobs based on input")
    parser.add_argument('--job', type=str, required=True, help="The job to run (e.g. 'tournamentTeams')")
    parser.add_argument('--seriesId', type=str, required=True, help="The seriesId to use for the tournamentTeams job")
    args = parser.parse_args()

    scheduler = BackgroundScheduler()

    if args.job == 'tournamentTeams':
        def job_wrapper():
            with app.app_context():  # Ensures Flask context is available inside the job
                populate_tournamentTeams(supabase, args.seriesId)

        scheduler.add_job(job_wrapper, 'interval', seconds=15)  # Run job every 30 seconds

    elif args.job == 'tournamentPlayers':
        def job_wrapper():
            with app.app_context():  
                populate_tournamentPlayers(supabase, args.seriesId)

        scheduler.add_job(job_wrapper, 'interval', seconds=15)  
    else:
        print("Invalid job specified. Please choose 'tournamentTeams'.")
        return

    scheduler.start()
    print(f"Scheduler started for job '{args.job}' with seriesId: {args.seriesId}")

    try:
        while True:
            time.sleep(2)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        print("Scheduler shut down")

if __name__ == "__main__":
    main()
