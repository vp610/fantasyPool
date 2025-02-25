from dotenv import load_dotenv
import os

load_dotenv() # loads env

class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev')

    # RapidAPI credentials
    X_RAPIDAPI_KEY = os.getenv('X_RAPIDAPI_KEY')
    X_RAPIDAPI_HOST = os.getenv('X_RAPIDAPI_HOST')
    ENDPOINT_URL = "https://cricbuzz-cricket.p.rapidapi.com"
    headersObj = {
        'x-rapidapi-key': X_RAPIDAPI_KEY,
        'x-rapidapi-host': X_RAPIDAPI_HOST
    }

    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')
    CACHE_REDIS_URL = os.getenv('CACHE_REDIS_URL')
