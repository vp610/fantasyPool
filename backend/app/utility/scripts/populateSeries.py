import requests
from supabase import Client, create_client
from datetime import datetime
import os
from dotenv import load_dotenv
import uuid

# Load environment variables
load_dotenv()
# API configuration
API_URL = "https://cricbuzz-cricket.p.rapidapi.com/series/v1/international"
HEADERS = {
    'x-rapidapi-key': os.getenv('X_RAPIDAPI_KEY'),
    'x-rapidapi-host': os.getenv('X_RAPIDAPI_HOST')
}

def fetch_series_data():
    """Fetch series data from the external API."""
    response = requests.get(API_URL, headers=HEADERS)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"API request failed: {response.status_code}", response.json())
        return None
    
def get_sport_id(supabase: Client, sport_name: str):
    """Get the sport ID from the tournaments table."""
    response = supabase.table("sports").select("id").eq("name", sport_name).execute()
    if response.data:
        return response.data[0]["id"]
    else:
        insert_response = supabase.table("sports").insert({"id": str(uuid.uuid4()), "name": sport_name, "createdAt": str(datetime.now())}).execute()
        print(insert_response)
        if insert_response.data:
            return insert_response.data[0]["id"]
        else:
            print(f"Failed to insert sport {sport_name}", insert_response.json())
            return None

def populate_tournaments_table(supabase: Client, series_data):
    """Populate the tournaments table in Supabase with series data."""
    sport_id = get_sport_id(supabase, "Cricket")
    if not sport_id:
        print("Sport ID for Cricket not found. Exiting.")
        return

    tournaments = []
    for series_map in series_data.get("seriesMapProto", []):
        for series in series_map.get("series", []):
            tournaments.append({
                "name": series["name"],
                "sportId": sport_id,
                "startDate": datetime.fromtimestamp(int(series["startDt"]) / 1000).isoformat(),
                "endDate": datetime.fromtimestamp(int(series["endDt"]) / 1000).isoformat(),
                "status": True,
                "seriesId": series["id"],
            })

    # Insert data into Supabase
    response = supabase.table("tournaments").upsert(tournaments).execute()
    if response:
        print("Tournaments data inserted successfully")
    else:
        print("Failed to insert tournaments data", response.json())

def main(supabase: Client):
    series_data = fetch_series_data()
    if series_data:
        populate_tournaments_table(supabase, series_data)

if __name__ == "__main__":
    # Supabase configuration
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')

    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    main(supabase)