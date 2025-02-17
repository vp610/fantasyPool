import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { User, StandingPlayer, StandingTeam } from '../../types';
import { RootState } from '../../store/store';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { FaTrophy, FaUsers, FaSpinner } from 'react-icons/fa'; // Importing FaSpinner

type Standing = {
    user: User;
    score: number;
    players: StandingPlayer[];
    teams: StandingTeam[];
};

export const PoolPage: React.FC = () => {
    const { poolId } = useParams<{ poolId: string }>();
    const { user } = useAuth();
    const [standings, setStandings] = useState<Standing[] | null>(null);
    const [players, setPlayers] = useState<StandingPlayer[]>([]);
    const [teams, setTeams] = useState<StandingTeam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const gradientIndex = useSelector((state: RootState) => state.color.gradientIndex);

    useEffect(() => {
        const fetchPoolData = async () => {
            if (!user?.id) {
                return;
            }
            try {
                const standingsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/pool/standings/${poolId}`);
                const standingsData: Standing[] = standingsResponse.data;
                setStandings(standingsData);

                const userStanding = standingsData.find((standing) => user.id === standing.user.authId);

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

        if (user) {
            fetchPoolData();
        }
    }, [poolId, user]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <FaSpinner className="animate-spin -ml-1 mr-3 h-10 w-10 text-gray-700" />
            <p className="text-xl font-semibold text-gray-700">Loading...</p>
        </div>
    );
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
        <div className="bg-gray-100 min-h-screen py-8 text-gray-800">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center">
                            <FaTrophy className="mr-3 text-yellow-500" />
                            Standings
                        </h2>
                        <div className="bg-white rounded-md shadow-md overflow-hidden">
                            <table className="min-w-full">
                                <thead className="bg-gradient-to-r from-gray-800 to-gray-600 text-gray-100 shadow-md text-gray-700">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-sm font-semibold">Player</th>
                                        <th className="py-3 px-4 text-left text-sm font-semibold">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings?.map((standing, index) => (
                                        <tr
                                            key={standing.user.id}
                                            className="hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            <td className="py-3 px-4 border-b border-gray-200 flex items-center">
                                                {index < 3 && <span className="animate-bounce mr-2">{getEmoji(index)}</span>}
                                                {standing.user.username}
                                            </td>
                                            <td className="py-3 px-4 border-b border-gray-200">{standing.score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center">
                            <FaUsers className="mr-3 text-blue-500" />
                            Your Selection
                        </h2>
                        <div className="bg-white rounded-md shadow-md p-6">
                            {(players.length > 0 || teams.length > 0) ? (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Teams</h3>
                                    <ul className="mb-4">
                                        {teams.map((teamObj) => (
                                            <li key={teamObj.team.id} className="py-2 px-4 border-b">
                                                {teamObj.team.name} - {teamObj.score} points
                                            </li>
                                        ))}
                                    </ul>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Players</h3>
                                    <ul>
                                        {players.map((playerObj) => (
                                            <li key={playerObj.player.id} className="py-2 px-4 border-b">
                                                {playerObj.player.name} - {playerObj.score} points
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="text-center py-4">No selection found</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
