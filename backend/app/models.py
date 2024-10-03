from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    teams_selected = db.Column(db.String(255), nullable=True)  
    players_selected = db.Column(db.String(255), nullable=True) 
    points = db.Column(db.Integer, default=0)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Team(db.Model):
    __tablename__ = 'teams'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    teamId = db.Column(db.Integer, unique=True, nullable=False)

class Player(db.Model):
    __tablename__ = 'players'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    playerId = db.Column(db.Integer, unique=True, nullable=False)
    role = db.Column(db.String(100), nullable=False)
    teamId = db.Column(db.Integer, db.ForeignKey('teams.teamId'), nullable=False)
