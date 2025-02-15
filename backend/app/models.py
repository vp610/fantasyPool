from app import db

class sports(db.Model):
    id = db.Column(db.uuid, primary_key=True)
    name = db.Column(db.String, nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False)

class tournaments(db.Model):
    id = db.Column(db.uuid, primary_key=True)
    name = db.Column(db.String, nullable=False)
    sportId = db.Column(db.uuid, db.ForeignKey('sports.id'), nullable=False)
    startDate = db.Column(db.DateTime, nullable=False)
    endDate = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Boolean, nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False)

class teams(db.Model):
    __tablename__ = 'teams'
    id = db.Column(db.uuid, primary_key=True)
    name = db.Column(db.String, nullable=False)
    sportId = db.Column(db.uuid, db.ForeignKey('sports.id'), nullable=False)
    teamId = db.Column(db.Integer, primary_key=False)
    createdAt = db.Column(db.DateTime, nullable=False)

class team_results(db.Model):
    __tablename__ = 'team_results'
    id = db.Column(db.uuid, primary_key=True)
    tournamentId = db.Column(db.uuid, db.ForeignKey('tournaments.id'), nullable=False)
    teamId = db.Column(db.Integer, db.ForeignKey('teams.teamId'), nullable=False)
    totalGames = db.Column(db.Integer, nullable=False, default=0)
    totalWins = db.Column(db.Integer, nullable=False, default=0)
    totalLosses = db.Column(db.Integer, nullable=False, default=0)
    totalDraws = db.Column(db.Integer, nullable=False, default=0)
    createdAt = db.Column(db.DateTime, nullable=False)

class player_statistics(db.Model):
    __tablename__ = 'player_statistics'
    id = db.Column(db.uuid, primary_key=True)
    tournamentId = db.Column(db.uuid, db.ForeignKey('tournaments.id'), nullable=False)
    playerId = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False)
    sportId = db.Column(db.uuid, db.ForeignKey('sports.id'), nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False)

class player_statistics_cricket(db.Model):
    __tablename__ = 'player_statistics_cricket'
    id = db.Column(db.uuid, primary_key=True)
    playerStatsId = db.Column(db.uuid, db.ForeignKey('player_statistics.id'), nullable=False)
    threeWickets = db.Column(db.Integer, nullable=False, default=0)
    fiveWickets = db.Column(db.Integer, nullable=False, default=0)
    fifties = db.Column(db.Integer, nullable=False, default=0)
    hundreds = db.Column(db.Integer, nullable=False, default=0)
    createdAt = db.Column(db.DateTime, nullable=False)

class players(db.Model):
    __tablename__ = 'players'
    id = db.Column(db.uuid, primary_key=True)
    name = db.Column(db.String, nullable=False)
    teamId = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    playerId = db.Column(db.Integer, nullable=False)
    sportId = db.Column(db.uuid, db.ForeignKey('sports.id'), nullable=False)
    role = db.Column(db.String, nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False)

class users(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.uuid, primary_key=True)
    authId = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    username = db.Column(db.String, nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False)

class user_pools(db.Model):
    __tablename__ = 'user_pools'
    userId = db.Column(db.uuid, db.ForeignKey('users.id'), nullable=False, primary_key=True)
    poolId = db.Column(db.uuid, db.ForeignKey('pools.id'), nullable=False, primary_key=True)
    createdAt = db.Column(db.DateTime, nullable=False)

class user_players(db.Model):
    __tablename__ = 'user_players'
    userId = db.Column(db.uuid, db.ForeignKey('users.id'), nullable=False, primary_key=True)
    playerId = db.Column(db.Integer, db.ForeignKey('players.id'), nullable=False, primary_key=True)
    poolId = db.Column(db.uuid, db.ForeignKey('pools.id'), nullable=False, primary_key=True)
    createdAt = db.Column(db.DateTime, nullable=False)
    
class pools(db.Model):
    __tablename__ = 'pools'
    id = db.Column(db.uuid, primary_key=True)
    name = db.Column(db.String, nullable=False)
    tournamentId = db.Column(db.uuid, db.ForeignKey('tournaments.id'), nullable=False)
    startDate = db.Column(db.DateTime, nullable=False)
    endDate = db.Column(db.DateTime, nullable=False)
    participants = db.Column(db.Integer, default=0)
    winnerId = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    status = db.Column(db.Boolean, nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False)


