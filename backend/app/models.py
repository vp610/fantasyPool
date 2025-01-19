from app import db

class players(db.Model):
    __tablename__ = 'players'
    id = db.Column(db.uuid, primary_key=True)
    name = db.Column(db.String, nullable=False)
    playerId = db.Column(db.Integer, nullable=False)
    teamId = db.Column(db.Integer, db.ForeignKey('teams.teamId'), nullable=False)
    role = db.Column(db.String, nullable=False)
    numFifties = db.Column(db.Integer, nullable=False, default=0)
    numHundreds = db.Column(db.Integer, nullable=False, default=0)
    threeWickets = db.Column(db.Integer, nullable=False, default=0)
    fiveWickets = db.Column(db.Integer, nullable=False, default=0)
    createdAt = db.Column(db.DateTime, nullable=False)

class teams(db.Model):
    __tablename__ = 'teams'
    id = db.Column(db.uuid, primary_key=True)
    teamId = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False)

class users(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.uuid, primary_key=True)
    authId = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    username = db.Column(db.String, nullable=False)

class team_results(db.Model):
    __tablename__ = 'team_results'
    id = db.Column(db.uuid, primary_key=True)
    createdAt = db.Column(db.DateTime, nullable=False)
    teamId = db.Column(db.Integer, db.ForeignKey('teams.teamId'), nullable=False)
    poolId = db.Column(db.uuid, db.ForeignKey('pools.id'), nullable=False)
    totalGames = db.Column(db.Integer, nullable=False, default=0)
    totalWins = db.Column(db.Integer, nullable=False, default=0)
    totalLosses = db.Column(db.Integer, nullable=False, default=0)
    totalDraws = db.Column(db.Integer, nullable=False, default=0)

class user_pools(db.Model):
    __tablename__ = 'user_pools'
    id = db.Column(db.uuid, primary_key=True)
    createdAt = db.Column(db.DateTime, nullable=False)
    userId = db.Column(db.uuid, db.ForeignKey('users.id'), nullable=False)
    poolId = db.Column(db.uuid, db.ForeignKey('pools.id'), nullable=False)

class user_pools(db.Model):
    __tablename__ = 'user_pools'
    createdAt = db.Column(db.DateTime, nullable=False)
    userId = db.Column(db.uuid, db.ForeignKey('users.id'), nullable=False, primary_key=True)
    poolId = db.Column(db.uuid, db.ForeignKey('pools.id'), nullable=False, primary_key=True)

class pools(db.Model):
    __tablename__ = 'pools'
    id = db.Column(db.uuid, primary_key=True)
    name = db.Column(db.String, nullable=False)
    startDate = db.Column(db.DateTime, nullable=False)
    endDate = db.Column(db.DateTime, nullable=False)
    participants = db.Column(db.Integer, default=0)
    winner = db.Column(db.uuid, nullable=True)

class user_players(db.Model):
    __tablename__ = 'user_players'
    createdAt = db.Column(db.DateTime, nullable=False)
    userId = db.Column(db.uuid, db.ForeignKey('users.id'), nullable=False, primary_key=True)
    playerId = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False, primary_key=True)
    poolId = db.Column(db.uuid, db.ForeignKey('pools.id'), nullable=False, primary_key=True)
