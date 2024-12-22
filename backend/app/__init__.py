from flask import Flask
from config import Config
from apscheduler.schedulers.background import BackgroundScheduler
from services.supabase_service import SupabaseService

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize Supabase service
    supabase_service = SupabaseService()

    @app.route('/')
    def index():
        return "Welcome to the Supabase integrated application!"

    # Initialize the scheduler
    from app.cron_job.cron_jobs import fetch_match_data

    scheduler = BackgroundScheduler()
    scheduler.add_job(func=lambda: fetch_match_data(supabase_service), trigger="interval", seconds=25200)
    scheduler.start()

    print("Scheduler has started!")  # Confirm scheduler starts

    return app
