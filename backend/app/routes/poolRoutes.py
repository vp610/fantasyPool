from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from supabase import create_client, Client
from config import Config
from app.cacheModule import cache  # Global cache instance

pool_api = Blueprint('pool_api', __name__)

supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

### Dashboard APIs ###
@pool_api.route('/<poolId>/<authId>', methods=['DELETE'])
def delete_pool(poolId, authId):
    try:
        userId = supabase.table('users').select('id').eq("authId", authId).execute().data[0]['id']
        res = supabase.table('userPools').delete().eq("poolId", poolId).eq("userId", userId).execute()
        res2 = supabase.table('userPlayers').delete().eq("poolId", poolId).eq("userId", userId).execute()
        res3 = supabase.table('userTeams').delete().eq("poolId", poolId).eq("userId", userId).execute()
        if res.data and res2.data and res3.data:
            return jsonify({"message": "Pool deleted successfully"}), 200
        else:
            return jsonify({"error": "Failed to delete pool"}), 500
    except Exception as e:
        print("Error querying Supabase:", e)
        return jsonify({"error": str(e)}), 500



@pool_api.route('/teams/<poolId>', methods=['GET'])
@cache.cached(timeout=900, query_string=True)
def get_all_teams(poolId):
    try:
        # Get the tournamentId from the pool
        pool_data = supabase.table('pools')\
            .select('tournamentId')\
            .eq("id", poolId)\
            .execute().data
        if not pool_data:
            return jsonify({"error": "Pool not found"}), 404
        tournamentId = pool_data[0]['tournamentId']

        # Get all tournamentTeams in one query
        teams_res = supabase.table('tournamentTeams')\
            .select('*')\
            .eq("tournamentId", tournamentId)\
            .execute().data

        if not teams_res:
            return jsonify({"error": "Teams not found"}), 404

        # Batch fetch team names using the unique teamIds
        team_ids = list({team['teamId'] for team in teams_res})
        teams_data = supabase.table('teams')\
            .select('id, name')\
            .in_("id", team_ids)\
            .execute().data
        teams_dict = {team['id']: team['name'] for team in teams_data}

        # Build the result mapping teamId -> teamName
        teamData = {tid: teams_dict.get(tid, "Unknown") for tid in team_ids}
        return jsonify(teamData), 200
    except Exception as e:
        print("Error querying Supabase:", e)
        return jsonify({"error": str(e)}), 500

@pool_api.route('/players/<poolId>', methods=['GET'])
@cache.cached(timeout=900, query_string=True)
def get_all_players(poolId):
    try:
        # Get tournamentId from pool
        pool_data = supabase.table('pools')\
            .select('tournamentId')\
            .eq("id", poolId)\
            .execute().data
        if not pool_data:
            return jsonify({"error": "Pool not found"}), 404
        tournamentId = pool_data[0]['tournamentId']

        # Fetch all tournament players at once
        tournamentPlayers = supabase.table('tournamentPlayers')\
            .select('*')\
            .eq("tournamentId", tournamentId)\
            .execute().data
        if not tournamentPlayers:
            return jsonify({"error": "No tournament players found"}), 404

        # Extract unique teamIds and playerIds
        teamIds = list({tp['teamId'] for tp in tournamentPlayers})
        playerIds = list({tp['playerId'] for tp in tournamentPlayers})

        # Batch query teams for names
        teamsData = supabase.table('teams')\
            .select('id, name')\
            .in_("id", teamIds)\
            .execute().data
        teamsDict = {team['id']: team['name'] for team in teamsData}

        # Batch query players for details
        playersData = supabase.table('players')\
            .select('*')\
            .in_("id", playerIds)\
            .execute().data
        playersDict = {player['id']: player for player in playersData}

        # Assemble response grouped by team name
        res = {}
        for tp in tournamentPlayers:
            teamId = tp['teamId']
            teamName = teamsDict.get(teamId, "Unknown")
            if teamName not in res:
                res[teamName] = {"teamId": teamId, "players": []}
            playerDetail = playersDict.get(tp['playerId'])
            if playerDetail:
                res[teamName]["players"].append(playerDetail)
        return jsonify(res), 200

    except Exception as e:
        print("Error querying Supabase:", e)
        return jsonify({"error": str(e)}), 500

@pool_api.route('/user-selection', methods=['POST'])
@cross_origin() 
@cache.cached(timeout=900, query_string=True) 
def post_save_user_selection():
    # print("post_save_user_selection")
    try:
        data = request.get_json()
        # print("data:", data)
        authId = data['authId']
        poolId = data['poolId']
        players = data['players']
        teams = data['teams']
        userId = supabase.table('users').select('id').eq("authId", authId).execute().data[0]['id']
        
        for player in players:
            data = {
                "userId": userId,
                "playerId": player,
                "poolId": poolId
            }
            # print("data:", data)
            if supabase.table('userPlayers').select('*').eq("userId", userId).eq("playerId", player).eq("poolId", poolId).execute().data:
                continue
            supabase.table('userPlayers').insert(data).execute()
        
        for team in teams:
            data = {
                "userId": userId,
                "teamId": team,
                "poolId": poolId
            }
            # print("data:", data)
            if supabase.table('userTeams').select('*').eq("userId", userId).eq("teamId", team).eq("poolId", poolId).execute().data:
                continue
            supabase.table('userTeams').insert(data).execute()

        if len(supabase.table('userPlayers').select('*').eq("userId", userId).eq("poolId", poolId).execute().data) == 3 and len(supabase.table('userTeams').select('*').eq("userId", userId).eq("poolId", poolId).execute().data) == 3:
            supabase.table('userPools').insert({'userId': userId, 'poolId': poolId}).execute()
        
        return jsonify({"message": "User selection saved successfully"}), 200

    except Exception as e:
        print("Error querying Supabase:", e)
        return jsonify({"error": str(e)}), 500
 

@pool_api.route('/standings/<poolId>', methods=['GET'])
@cache.cached(timeout=900, query_string=True)
def get_standings(poolId):
    try:
        # Get tournamentId
        pool_data = supabase.table('pools')\
            .select('tournamentId')\
            .eq("id", poolId)\
            .execute().data
        if not pool_data:
            return jsonify({"error": "Pool not found"}), 404
        tournamentId = pool_data[0]['tournamentId']

        # Batch query team results
        team_results = supabase.table('teamResults')\
            .select('*')\
            .eq("tournamentId", tournamentId)\
            .execute().data

        # Batch query teams
        teamIds = list({result['teamId'] for result in team_results})
        teamsData = supabase.table('teams')\
            .select('*')\
            .in_("id", teamIds)\
            .execute().data
        teamsDict = {team['id']: team for team in teamsData}

        teamStandings = {}
        for result in team_results:
            tid = result['teamId']
            team_info = teamsDict.get(tid, {})
            teamStandings[tid] = {
                "team": team_info,
                "teamStats": result,
                "score": result.get('totalWins', 0) * 10 + result.get('totalDraws', 0) * 5
            }

        # Batch query player statistics
        playerStatsData = supabase.table('playerStatistics')\
            .select('*')\
            .eq("tournamentId", tournamentId)\
            .execute().data
        if playerStatsData is None:
            playerStatsData = []

        # Batch query players
        playerIds = list({p['playerId'] for p in playerStatsData})
        playersData = supabase.table('players')\
            .select('*')\
            .in_("id", playerIds)\
            .execute().data
        playersDict = {player['id']: player for player in playersData}

        # Batch query cricket-specific stats
        playerStatsIds = [p['id'] for p in playerStatsData]
        cricketStatsData = supabase.table('playerStatsCricket')\
            .select('*')\
            .in_("playerStatsId", playerStatsIds)\
            .execute().data
        cricketStatsDict = {stat['playerStatsId']: stat for stat in cricketStatsData}

        playerStandings = {}
        for p_stat in playerStatsData:
            pid = p_stat['playerId']
            stats = cricketStatsDict.get(p_stat['id'], {})
            score = (
                stats.get('threeWickets', 0) * 3 +
                stats.get('fiveWickets', 0) * 5 +
                stats.get('fifties', 0) * 3 +
                stats.get('hundreds', 0) * 5
            )
            playerStandings[pid] = {
                "player": playersDict.get(pid, {}),
                "playerStats": stats,
                "score": score
            }

        # Batch query user selections
        userPools = supabase.table('userPools')\
            .select('*')\
            .eq("poolId", poolId)\
            .execute().data

        # Get all userIds and then batch query users
        userIds = [entry['userId'] for entry in userPools]
        usersData = supabase.table('users')\
            .select('*')\
            .in_("id", userIds)\
            .execute().data
        usersDict = {user['id']: user for user in usersData}

        # Batch query userPlayers and userTeams for the pool
        userPlayers = supabase.table('userPlayers')\
            .select('*')\
            .eq("poolId", poolId)\
            .execute().data
        userTeams = supabase.table('userTeams')\
            .select('*')\
            .eq("poolId", poolId)\
            .execute().data

        from collections import defaultdict
        players_by_user = defaultdict(list)
        for up in userPlayers:
            players_by_user[up['userId']].append(up)
        teams_by_user = defaultdict(list)
        for ut in userTeams:
            teams_by_user[ut['userId']].append(ut)

        standings = []
        for entry in userPools:
            uid = entry['userId']
            user_obj = usersDict.get(uid, {})
            userScore = 0
            playerScore = []
            for up in players_by_user[uid]:
                pid = up.get('playerId')
                pdata = playerStandings.get(pid, {"player": {}, "playerStats": {}, "score": 0})
                playerScore.append({
                    "player": pdata["player"],
                    "playerStats": pdata["playerStats"],
                    "score": pdata["score"]
                })
                userScore += pdata["score"]
            teamScore = []
            for ut in teams_by_user[uid]:
                tid = ut.get('teamId')
                tdata = teamStandings.get(tid, {"team": {}, "teamStats": {}, "score": 0})
                teamScore.append({
                    "team": tdata["team"],
                    "teamStats": tdata["teamStats"],
                    "score": tdata["score"]
                })
                userScore += tdata["score"]
            standings.append({
                "user": user_obj,
                "score": userScore,
                "players": playerScore,
                "teams": teamScore
            })
        standings = sorted(standings, key=lambda x: x['score'], reverse=True)
        return jsonify(standings), 200

    except Exception as e:
        print("Error querying Supabase:", e)
        return jsonify({"error": str(e)}), 500















# from flask import Blueprint, jsonify, current_app, request
# from app.utility.headers import get_headers
# from supabase import create_client, Client
# from config import Config
# from flask_cors import cross_origin
# from cacheModule import cache

# pool_api = Blueprint('pool_api', __name__)

# # Initialize Supabase client
# supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
    
# @pool_api.route('/teams/<poolId>', methods=['GET'])
# @cache.cached(timeout=900, query_string=True) 
# def get_all_teams(poolId):
#     try:
#         print("poolId:", poolId)
#         tournamentId = supabase.table('pools').select('tournamentId').eq("id", poolId).execute().data[0]['tournamentId']
#         teams = supabase.table('tournamentTeams').select('*').eq("tournamentId", tournamentId).execute()
#         print("teams:", teams.data)
#         if teams.data:
#             teamData = {}
#             for team in teams.data:
#                 print("team:", team)
#                 teamName = supabase.table('teams').select('name').eq("id", team['teamId']).execute().data[0]['name']
#                 teamData[team['teamId']] = teamName
#             print("teamData:", teamData)
#             return jsonify(teamData), 200
#         else:
#             return jsonify({"error": "Teams not found"}), 404
#     except Exception as e:
#         print("Error querying Supabase:", e)
#         return jsonify({"error": str(e)}), 500

# @pool_api.route('/players/<poolId>', methods=['GET'])
# @cache.cached(timeout=900, query_string=True) 
# def get_all_players(poolId):
#     try:
#         # print("poolId:", poolId)
#         tournamentId = supabase.table('pools').select('tournamentId').eq("id", poolId).execute().data[0]['tournamentId']
#         players = supabase.table('tournamentPlayers').select('*').eq("tournamentId", tournamentId).execute()

#         res = {}
#         for player in players.data:
#             teamName = supabase.table('teams').select('name').eq("id", player['teamId']).execute().data[0]['name']
#             if teamName not in res:
#                 res[teamName] = {"teamId": player['teamId'], "players": []}
#             p = supabase.table('players').select('*').eq("id", player['playerId']).execute().data
#             res[teamName]["players"].append(p)
#         # print("res:", res)
#         return jsonify(res), 200
#     except Exception as e:
#         print("Error querying Supabase:", e)
#         return jsonify({"error": str(e)}), 500
    
# @pool_api.route('/user-selection', methods=['POST'])
# @cross_origin() 
# @cache.cached(timeout=900, query_string=True) 
# def post_save_user_selection():
#     # print("post_save_user_selection")
#     try:
#         data = request.get_json()
#         # print("data:", data)
#         authId = data['authId']
#         poolId = data['poolId']
#         players = data['players']
#         teams = data['teams']
#         userId = supabase.table('users').select('id').eq("authId", authId).execute().data[0]['id']
        
#         for player in players:
#             data = {
#                 "userId": userId,
#                 "playerId": player,
#                 "poolId": poolId
#             }
#             # print("data:", data)
#             if supabase.table('userPlayers').select('*').eq("userId", userId).eq("playerId", player).eq("poolId", poolId).execute().data:
#                 continue
#             supabase.table('userPlayers').insert(data).execute()
        
#         for team in teams:
#             data = {
#                 "userId": userId,
#                 "teamId": team,
#                 "poolId": poolId
#             }
#             # print("data:", data)
#             if supabase.table('userTeams').select('*').eq("userId", userId).eq("teamId", team).eq("poolId", poolId).execute().data:
#                 continue
#             supabase.table('userTeams').insert(data).execute()

#         if len(supabase.table('userPlayers').select('*').eq("userId", userId).eq("poolId", poolId).execute().data) == 3 and len(supabase.table('userTeams').select('*').eq("userId", userId).eq("poolId", poolId).execute().data) == 3:
#             supabase.table('userPools').insert({'userId': userId, 'poolId': poolId}).execute()
        
#         return jsonify({"message": "User selection saved successfully"}), 200

#     except Exception as e:
#         print("Error querying Supabase:", e)
#         return jsonify({"error": str(e)}), 500
    
# # @pool_api.route('/user-selection/<authId>/<poolId>', methods=['GET'])
# # def get_user_selection(authId, poolId):
# #     try:
# #         userId = supabase.table('users').select('id').eq("authId", authId).execute().data[0]['id']
# #         userPlayers = supabase.table('userPlayers').select('*').eq("userId", userId).eq("poolId", poolId).execute().data
# #         players = []
# #         for player in userPlayers:
# #             p = supabase.table('players').select('*').eq("id", player['playerId']).execute().data[0]
# #             players.append(p)
        
# #         userTeams = supabase.table('userTeams').select('*').eq("userId", userId).eq("poolId", poolId).execute().data
# #         teams = []
# #         for team in userTeams:
# #             t = supabase.table('teams').select('*').eq("id", team['teamId']).execute().data[0]
# #             teams.append(t)

# #         return jsonify({"userPlayers": players, "userTeams": teams}), 200
# #     except Exception as e:
# #         print("Error querying Supabase:", e)
# #         return jsonify({"error": str(e)}), 500


# @pool_api.route('/standings/<poolId>', methods=['GET'])
# @cache.cached(timeout=900, query_string=True) 
# def get_standings(poolId):
#     try:        
#         tournamentId = supabase.table('pools').select('tournamentId').eq("id", poolId).execute().data[0]['tournamentId']
#         teams = supabase.table('teamResults').select('*').eq("tournamentId", tournamentId).execute().data

#         teamStandings = {}
#         for team in teams:
#             teamId = team['teamId']  
#             t = supabase.table('teams').select('*').eq("id", teamId).execute().data[0]
#             teamStandings[teamId] = {
#                 "team": t,
#                 "teamStats": team, 
#                 "score": team['totalWins'] * 10 + team['totalDraws'] * 5 + team['totalLosses'] * 0
#             }

#         playerStatsIds = supabase.table('playerStatistics').select('*').eq("tournamentId", tournamentId).execute().data
#         playerStandings = {}
#         for player in playerStatsIds:
#             playerStatsId = player['id']
#             p = supabase.table('players').select('*').eq("id", player['playerId']).execute().data[0]
#             playerStatsData = supabase.table('playerStatsCricket').select('*').eq("playerStatsId", playerStatsId).execute().data
#             playerStats = playerStatsData[0] if playerStatsData else {}

#             playerStandings[player['playerId']] = {
#                 "player": p,
#                 "playerStats": playerStats,
#                 "score": playerStats.get('threeWickets', 0) * 3 
#                          + playerStats.get('fiveWickets', 0) * 5 
#                          + playerStats.get('fifties', 0) * 3 
#                          + playerStats.get('hundreds', 0) * 5
#             }

#         # print("playerStandings:", playerStandings)

#         users = supabase.table('userPools').select('*').eq("poolId", poolId).execute().data
#         standings = []

#         for user in users:
#             userId = user['userId']
#             userPlayers = supabase.table('userPlayers').select('*').eq("userId", userId).eq("poolId", poolId).execute().data
#             userTeams = supabase.table('userTeams').select('*').eq("userId", userId).eq("poolId", poolId).execute().data
#             userScore = 0
            
#             playerScore = []
#             for player in userPlayers:
#                 playerId = player.get('playerId') # I don't think we need this and this is not the right way, if player stats are not in db init the player stats then return info
#                 if playerId:
#                     playerData = playerStandings.get(playerId, {"player": player, "playerStats": {}, "score": 0})
#                     score = playerData["score"]
#                 else:
#                     playerData = {"player": player, "playerStats": {}, "score": 0}
#                     score = 0
                
#                 playerScore.append({
#                     "player": playerData["player"],
#                     "playerStats": playerData["playerStats"],
#                     "score": score
#                 })
#                 userScore += score

#             teamScore = []
#             for team in userTeams:
#                 print(team)
#                 if 'teamId' in team:
#                     print("teamId:", teamId)
#                     teamData = teamStandings.get(team["teamId"], {"team": team, "teamStats": {}, "score": 0})
#                     score = teamData["score"]
#                 else:
#                     teamData = {"team": team, "teamStats": {}, "score": 0}
#                     score = 0

#                 teamScore.append({
#                     "team": teamData["team"],
#                     "teamStats": teamData["teamStats"], 
#                     "score": score
#                 })                
#                 userScore += score

#             user = supabase.table('users').select('*').eq("id", userId).execute().data[0]
#             standings.append({
#                 "user": user, 
#                 "score": userScore, 
#                 "players": playerScore, 
#                 "teams": teamScore
#             })

#         # print("standings before sorting:", standings)

#         standings = sorted(standings, key=lambda x: x['score'], reverse=True)
#         # print("standings after sorting:", standings)

#         return jsonify(standings), 200

#     except Exception as e:
#         print("Error querying Supabase:", e)
#         return jsonify({"error": str(e)}), 500
