from flask import Blueprint
from flask_cors import CORS

api = Blueprint('api', __name__)

from .generalRoutes import general_api
from .profileRoutes import profile_api
from .dashboardRoutes import dashboard_api
from .tournamentRoutes import tournament_api
from .poolRoutes import pool_api

CORS(general_api, supports_credentials=True)
CORS(profile_api, supports_credentials=True)
CORS(dashboard_api, supports_credentials=True)
CORS(tournament_api, supports_credentials=True)
CORS(pool_api, supports_credentials=True)

api.register_blueprint(general_api, url_prefix='/general')
api.register_blueprint(profile_api, url_prefix='/profile')
api.register_blueprint(dashboard_api, url_prefix='/dashboard')
api.register_blueprint(tournament_api, url_prefix='/tournament')
api.register_blueprint(pool_api, url_prefix='/pool')
