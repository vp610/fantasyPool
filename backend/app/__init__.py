from flask import Flask, current_app
from flask_sqlalchemy import SQLAlchemy
from config import Config
from apscheduler.schedulers.background import BackgroundScheduler
import requests

# Initialize the SQLAlchemy instance here
db = SQLAlchemy()

def fetch_match_data():
    # Fetch data from the API
    api_url = "https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/"
    response = requests.get(api_url, headers=current_app["headers"])

    if response.status_code == 200:
        data = response.json()
        # Process and store data in the SQLite database
        for team_data in data['teams']:
            team = Team.query.filter_by(name=team_data['name']).first()
            if not team:
                team = Team(name=team_data['name'])
                db.session.add(team)
        
        for player_data in data['players']:
            player = Player.query.filter_by(name=player_data['name']).first()
            if not player:
                player = Player(name=player_data['name'])
                db.session.add(player)

        db.session.commit()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config) 
    
    db.init_app(app) 
    
    from app.models import Team, Player
    
    with app.app_context():
        db.create_all()  # Create the database tables
    
    # Start cron job scheduler
    scheduler = BackgroundScheduler()
    # scheduler.add_job(func=fetch_match_data, trigger="interval", hours=6)
    # scheduler.start()
    
    from app.routes import main
    app.register_blueprint(main)
        
    return app
