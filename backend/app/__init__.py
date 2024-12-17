from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config
from apscheduler.schedulers.background import BackgroundScheduler

# Initialize the SQLAlchemy instance here
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize db with the app
    db.init_app(app)

    # Register the main blueprint
    from app.routes import main
    app.register_blueprint(main)

    # Initialize the database and populate if necessary
    with app.app_context():
        from app.models import Team, Player, User, user_teams, user_players, user_pools
        
        # Drop and create all tables (careful with this in production)
        # db.drop_all()
        db.create_all()  # Create the database tables

        # Import and call get_teams and get_players functions
        from app.routes import get_teams, get_players  # Import here to avoid circular imports

        # Check and populate teams and players if necessary
        if Team.query.count() == 0:
            get_teams()  # Fetch teams if not already in the DB
        
        if Player.query.count() == 0:
            get_players()  # Fetch players if not already in the DB

    # Initialize the scheduler
    from app.cron_job.cron_jobs import fetch_match_data

    scheduler = BackgroundScheduler()
    # Pass app instance to the cron job
    scheduler.add_job(func=lambda: fetch_match_data(app), trigger="interval", seconds=25200)
    scheduler.start()

    print("Scheduler has started!")  # Confirm scheduler starts

    return app
