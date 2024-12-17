
from flask import current_app

#########################################################################################
################################### Utility functions ###################################
#########################################################################################

def get_headers():
    return {
        'x-rapidapi-key': current_app.config['X_RAPIDAPI_KEY'],
        'x-rapidapi-host': current_app.config['X_RAPIDAPI_HOST']
    }