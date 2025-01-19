import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
// import { Player, Team, UserSelection } from '../../types';
import { Player, Team, User } from '../../types';
import { dummyUsers } from '../../data/users';
import { useAuth0 } from '@auth0/auth0-react';
import { RootState } from '../../store/store';
import { gradients } from '../../constants/constants';

interface UserSelection {
  teams: string[];
  players: string[];
}

export const PoolPage: React.FC = () => {
  const { poolId } = useParams<{ poolId: string }>();
  const { user, isAuthenticated } = useAuth0();
  const [standings, setStandings] = useState<User[]>([]);
  // const [userSelection, setUserSelection] = useState<UserSelection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const gradientIndex = useSelector((state: RootState) => state.color.gradientIndex);

  useEffect(() => {
    const fetchPoolData = async () => {
      try {
        // Fetch standings
        // const standingsResponse = await fetch(`/api/pools/${poolId}/standings`);
        // if (!standingsResponse.ok) {
        //   throw new Error('Failed to fetch standings');
        // }
        // const standingsData = await standingsResponse.json();
        // setStandings(standingsData);

        // Fetch user selection
        // const userSelectionResponse = await fetch(`/api/pools/${poolId}/user-selection/${user.sub}`);
        // if (!userSelectionResponse.ok) {
        //   throw new Error('Failed to fetch user selection');
        // }
        // const userSelectionData = await userSelectionResponse.json();
        // setUserSelection(userSelectionData);

        setTimeout(() => {
          setStandings(dummyUsers);
          setLoading(false);
        }, 1000);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(String(error));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPoolData();
  }, [poolId]);

  if (loading) return <div>Loading...</div>;
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
              {standings.map((user, index) => (
                <tr
                  key={user.id}
                  className={`hover:bg-gray-100 transition-colors duration-200 slide-in`}
                >
                  <td className="py-3 px-4 border-b border-gray-200 flex items-center">
                    {index < 3 && (
                      <span className="animate-bounce mr-2">{getEmoji(index)}</span>
                    )}
                    <img
                      src={user.image}
                      alt={user.username}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    {user.username}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-200">{user.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Selection</h2>
          {/* {userSelection ? (
            <div>
              <h3 className="text-xl font-bold text-gray-800">Teams</h3>
              <ul className="mb-4">
                {userSelection.teams.map((team) => (
                  <li key={team.id} className="py-2 px-4 border-b">
                    {team.name} - {team.points} points
                  </li>
                ))}
              </ul>
              <h3 className="text-xl font-bold text-gray-800">Players</h3>
              <ul>
                {userSelection.players.map((player) => (
                  <li key={player.id} className="py-2 px-4 border-b">
                    {player.name} - {player.points} points
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>No selection found</div>
          )} */}
        </div>
      </div>
    </div>
  );
};