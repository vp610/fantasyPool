import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { User, StandingPlayer, StandingTeam } from '../../types';
import { RootState } from '../../store/store';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { FaTrophy, FaUsers, FaSpinner, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [userStanding, setUserStanding] = useState<Standing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const gradientIndex = useSelector((state: RootState) => state.color.gradientIndex);

     const topThreeScores = standings
     ? Array.from(new Set(standings.map((s) => s.score)))
         .sort((a, b) => b - a)
         .slice(0, 3)
     : [];

    useEffect(() => {
        const fetchPoolData = async () => {
            if (!user?.id) return;
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/pool/standings/${poolId}`);
                const standingsData = response.data;
                setStandings(standingsData);
                const currentUserStanding = standingsData.find((s: Standing) => s.user.id === user.id);
                setUserStanding(currentUserStanding || null);
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

        if (user) fetchPoolData();
    }, [poolId, user]);

    if (loading) return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen"
        >
            <FaSpinner className="animate-spin h-10 w-10 text-gray-700" />
            <p className="text-xl font-semibold text-gray-700 mt-4">Loading...</p>
        </motion.div>
    );
    
    if (error) return <div className="text-red-500 text-center mt-4">Error: {error}</div>;

    const getMedal = (score: number) => {
        if (!topThreeScores.length) return '';
        if (score === topThreeScores[0]) return '🥇';
        if (topThreeScores.length > 1 && score === topThreeScores[1]) return '🥈';
        if (topThreeScores.length > 2 && score === topThreeScores[2]) return '🥉';
        return '';
    };

    const toggleUserExpansion = (userId: string) => {
        setExpandedUser(expandedUser === userId ? null : userId);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gray-100 min-h-screen py-8 text-gray-800"
        >
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center justify-center">
                    <FaTrophy className="mr-3 text-yellow-500" />
                    Pool Standings
                </h2>

                {/* User's own selection */}
                {userStanding && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your Selection</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2 text-gray-700">Teams</h4>
                                <ul className="space-y-2">
                                    {userStanding.teams.map((teamObj) => (
                                        <li key={teamObj.team.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                            <span>{teamObj.team.name}</span>
                                            <span className="font-semibold text-green-600">{teamObj.score} points</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 text-gray-700">Players</h4>
                                <ul className="space-y-2">
                                    {userStanding.players.map((playerObj) => (
                                        <li key={playerObj.player.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                                            <span>{playerObj.player.name}</span>
                                            <span className="font-semibold text-green-600">{playerObj.score} points</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Standings table */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                    <table className="min-w-full">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="py-3 px-4 text-left">User</th>
                                <th className="py-3 px-4 text-right">Score</th>
                                <th className="py-3 px-4 text-center">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {standings?.map((standing, index) => (
                                <React.Fragment key={standing.user.id}>
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`border-b ${standing.user.id === user?.id ? 'bg-blue-50' : ''}`}
                                    >
                                    <td className="py-3 px-4 flex items-center">
                                    {getMedal(standing.score) && (
                                        <span className="mr-2 text-xl">{getMedal(standing.score)}</span>
                                    )}
                                    {standing.user.username}
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-blue-600">{standing.score}</td>
                                    <td className="py-3 px-4 text-center">
                                    <button
                                        onClick={() => toggleUserExpansion(standing.user.id)}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        {expandedUser === standing.user.id ? <FaChevronUp /> : <FaChevronDown />}
                                    </button>
                                    </td>
                                </motion.tr>

                                {expandedUser === standing.user.id && (
                                    <motion.tr
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    >
                                    <td colSpan={3} className="py-4 px-6 bg-gray-50">
                                        {/* Teams and Players Details */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold mb-2 text-gray-700">Teams</h4>
                                            <ul className="space-y-2">
                                            {standing.teams.map((teamObj) => (
                                                <li key={teamObj.team.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                                <span>{teamObj.team.name}</span>
                                                <span className="font-semibold text-green-600">{teamObj.score} points</span>
                                                </li>
                                            ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2 text-gray-700">Players</h4>
                                            <ul className="space-y-2">
                                            {standing.players.map((playerObj) => (
                                                <li key={playerObj.player.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                                <span>{playerObj.player.name}</span>
                                                <span className="font-semibold text-green-600">{playerObj.score} points</span>
                                                </li>
                                            ))}
                                            </ul>
                                        </div>
                                        </div>
                                    </td>
                                    </motion.tr>
                                )}
                            </React.Fragment>
                            ))}
                        </tbody> 
                    </table> 
                </motion.div> 
            </div> 
        </motion.div> 
    ); 
};
