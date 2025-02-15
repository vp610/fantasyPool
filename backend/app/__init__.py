from flask import Flask
from config import Config
from apscheduler.schedulers.background import BackgroundScheduler
from supabase import create_client, Client
from flask_cors import CORS
from app.cacheModule import cache

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    cache.init_app(app, config={
        'CACHE_TYPE': 'RedisCache',
        'CACHE_REDIS_URL': app.config['CACHE_REDIS_URL']
    })
    CORS(app, supports_credentials=True)

    print("App created!")  # Confirm app creation

    # Initialize Supabase client
    supabase: Client = create_client(app.config['SUPABASE_URL'], app.config['SUPABASE_KEY'])

    print("Supabase client created!")  # Confirm Supabase client creation

    # Initialize the scheduler
    from app.cron_job.cron_jobs import initialize_teams_and_players, update_match_data

    scheduler = BackgroundScheduler()

    with app.app_context():
        print("Scheduler created!")  # Confirm scheduler creation

        def job_wrapper(func):
            """Ensure the job function runs within Flask app context."""
            with app.app_context():
                func(supabase)

        # Schedule jobs with context-aware wrappers
        # update_match_data(supabase)
        # scheduler.add_job(func=lambda: job_wrapper(initialize_teams_and_players), trigger="interval", seconds=10)
        scheduler.add_job(func=lambda: job_wrapper(update_match_data), trigger="interval", min=20)

        scheduler.start()
        print("Scheduler started")  # Confirm job addition

    from app.routes import api
    app.register_blueprint(api, url_prefix='/api')

    return app
