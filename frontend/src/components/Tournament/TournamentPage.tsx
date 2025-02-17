import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pool } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { FaCalendarAlt, FaEye, FaPlusCircle, FaTrophy } from 'react-icons/fa';
import { Loader } from 'lucide-react';

export function TournamentPage() {
    const { user } = useAuth();
    const { tournamentId } = useParams<{ tournamentId: string }>();
    const [pools, setPools] = useState<Pool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        const fetchPoolsForTournament = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/tournament/pools/${tournamentId}`);
                setPools(response.data);
            } catch (err) {
                if (axios.isAxiosError(err) && err.response) {
                    setError(err.response.data);
                } else {
                    setError('Error fetching pools');
                }
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchPoolsForTournament();
        }
    }, [tournamentId]);

    const handleJoin = (poolId: string) => {
        navigate(`/pool/join/${poolId}`);
    };

    const handleView = (poolId: string) => {
        navigate(`/pool/view/${poolId}`);
    };

    if (loading) return <Loader />;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="bg-gray-100 min-h-screen py-8 text-gray-800">
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-3xl font-semibold text-gray-900 mb-6 text-center flex items-center justify-center">
                    <FaTrophy className="mr-3 text-blue-500" />
                    Pools for Tournament
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pools.length > 0 ? (
                        pools.map(pool => (
                            <div
                                key={pool.id}
                                className="bg-white rounded-md shadow-md p-6 hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
                            >
                                <h3 className="text-2xl font-semibold text-gray-800 mb-2">{pool.name}</h3>
                                <p className="text-gray-600 mb-4 flex items-center">
                                    <FaCalendarAlt className="mr-2" />
                                    Ends on: {pool.endDate}
                                </p>
                                <p className="text-gray-500 mb-4">
                                    Participants: {pool.participants}
                                </p>
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => handleJoin(pool.id)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
                                    >
                                        <FaPlusCircle className="mr-2" />
                                        Join Pool
                                    </button>
                                    {/* <button
                                        onClick={() => handleView(pool.id)}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
                                    >
                                        <FaEye className="mr-2" />
                                        View
                                    </button> */}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600 text-center">No pools are currently available for this tournament.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
