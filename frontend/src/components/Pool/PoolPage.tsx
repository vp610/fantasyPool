import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Player, Team, User, PlayerStats, TeamStats, StandingTeam, StandingPlayer } from '../../types';
import { useAuth0 } from '@auth0/auth0-react';
import { RootState } from '../../store/store';
import { gradients } from '../../constants/constants';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

type Standing = {
  user: User;
  score: number;
  players: StandingPlayer[];
  teams: StandingTeam[];
};

const Loader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <svg
      className="animate-spin -ml-1 mr-3 h-10 w-10 text-gray-700"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      ></path>
    </svg>
    <p className="text-xl font-semibold text-gray-700">Loading...</p>
  </div>
);

export const PoolPage: React.FC = () => {
  const { poolId } = useParams<{ poolId: string }>();
  const { user } = useAuth();
  const [standings, setStandings] = useState<Standing[] | null>(null);
  // const [userSelection, setUserSelection] = useState<UserSelection | null>(null);
  const [players, setPlayers] = useState<StandingPlayer[]>([]);
  const [teams, setTeams] = useState<StandingTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const gradientIndex = useSelector((state: RootState) => state.color.gradientIndex);

  useEffect(() => {
    const fetchPoolData = async () => {
      if (!user?.id) {
        // setError("User ID is missing. Please log in again.");
        return;
      }
      try {
        const standingsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/pool/standings/${poolId}`);
        // const selectionResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/pool/user-selection/${user.id}/${poolId}`);

        const standingsData: Standing[] = standingsResponse.data;
        setStandings(standingsData);

        const userStanding = standingsData.find(
          (standing) => user.id === standing.user.authId
        );

        if (userStanding) {
          setPlayers(userStanding.players);
          setTeams(userStanding.teams);
        } else {
          setPlayers([]);
          setTeams([]);
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          const errorData = err.response.data;
          setError(typeof errorData === 'object' ? JSON.stringify(errorData) : errorData);
        } else {
          setError('Error fetching pool data');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user){
      fetchPoolData();
    }  
  }, [poolId, user]);

  if (loading) return <Loader />;
  if (error) return <div>Error: {error}</div>;

  const getEmoji = (index: number) => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Standings</h2>
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            {/* <thead className={`bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg`}> */}
            <thead className={`bg-gradient-to-r ${gradients[gradientIndex]} text-white shadow-lg`}>
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-white-700">Player</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-white-700">Points</th>
              </tr>
            </thead>
            <tbody>
              {standings?.map((standing, index) => (
                <tr
                  key={standing.user.id}
                  className={`hover:bg-gray-100 transition-colors duration-200 slide-in`}
                >
                  <td className="py-3 px-4 border-b border-gray-200 flex items-center">
                    {index < 3 && (
                      <span className="animate-bounce mr-2">{getEmoji(index)}</span>
                    )}
                    <img
                      // src={user.image}
                      alt={standing.user.username}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    {standing.user.username}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200">{standing.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Selection</h2>
          {(players.length > 0 || teams.length > 0) ? (
            <div>
              <h3 className="text-xl font-bold text-gray-800">Teams</h3>
              <ul className="mb-4">
                {teams.map((teamObj) => (
                  <li key={teamObj.team.id} className="py-2 px-4 border-b">
                    {teamObj.team.name} - {teamObj.score} points
                  </li>
                ))}
              </ul>
              <h3 className="text-xl font-bold text-gray-800">Players</h3>
              <ul>
                {players.map((playerObj) => (
                  <li key={playerObj.player.id} className="py-2 px-4 border-b">
                    {playerObj.player.name} - {playerObj.score} points
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>No selection found</div>
          )}
        </div>
      </div>
    </div>
  );
};