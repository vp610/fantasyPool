from app import db
from werkzeug.security import generate_password_hash, check_password_hash

# Association table between User and Team
user_teams = db.Table('user_teams',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('team_id', db.Integer, db.ForeignKey('teams.teamId'), primary_key=True)
)

# Association table between User and Player
user_players = db.Table('user_players',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('player_id', db.Integer, db.ForeignKey('players.playerId'), primary_key=True)
)

# Association table between User and Pool
user_pools = db.Table('user_pools',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('pool_id', db.Integer, db.ForeignKey('pools.id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    points = db.Column(db.Integer, default=0)

    # Many-to-many relationship with Team
    teams_selected = db.relationship('Team', secondary=user_teams, lazy='subquery',
                                     backref=db.backref('users', lazy=True))

    # Many-to-many relationship with Player
    players_selected = db.relationship('Player', secondary=user_players, lazy='subquery',
                                       backref=db.backref('users', lazy=True))

    # Many-to-many relationship with Pool
    pools_participated = db.relationship('Pool', secondary=user_pools, lazy='subquery',
                                         backref=db.backref('participants', lazy=True))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Team(db.Model):
    __tablename__ = 'teams'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    teamId = db.Column(db.Integer, unique=True, nullable=False)
    totalGames = db.Column(db.Integer, default=0)
    totalWins = db.Column(db.Integer, default=0)

class Player(db.Model):
    __tablename__ = 'players'
    id = db.Column(db.Integer, primary_key=True)
    teamId = db.Column(db.Integer, db.ForeignKey('teams.teamId'), nullable=False)
    playerId = db.Column(db.Integer, unique=True, nullable=False)
    name = db.Column(db.String(100), unique=True, nullable=False)
    role = db.Column(db.String(100), nullable=False)
    numFifties = db.Column(db.Integer, default=0)
    numHundreds = db.Column(db.Integer, default=0)
    threeWickets = db.Column(db.Integer, default=0)
    fiveWickets = db.Column(db.Integer, default=0)

class Pool(db.Model):
    __tablename__ = 'pools'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    totalPrize = db.Column(db.Integer, default=0)
    totalParticipants = db.Column(db.Integer, default=0)

    # Relationship for the winner, assuming winner is a username
    winner = db.Column(db.String(100), default='')
