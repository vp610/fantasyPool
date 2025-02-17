import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { Player } from '../../types';
import { countryFlags } from '../../data/countryFlags';
import { FaRunning } from 'react-icons/fa';
import { GiGloves, GiCricketBat } from 'react-icons/gi';
import { BiCricketBall } from 'react-icons/bi';
import { RootState } from '../../store/store';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { FaSpinner } from 'react-icons/fa';

interface TeamPlayersResponse {
    [teamName: string]: {
        players: Player[];
        teamId: string;
    };
}

const JoinPool: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { poolId } = useParams<{ poolId: string }>();
    const gradientIndex = useSelector((state: RootState) => state.color.gradientIndex);

    const [teams, setTeams] = useState<{ [key: string]: string }>({});
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [players, setPlayers] = useState<TeamPlayersResponse | null>(null);
    const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
    const [dropdownTeam, setDropdownTeam] = useState<string | null>(null);
    const [limitReached, setLimitReached] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const filteredPlayers = useMemo(() => {
        if (players && dropdownTeam) {
            return players[dropdownTeam]?.players || [];
        }
        return [];
    }, [players, dropdownTeam]);

    const fetchTeams = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/pool/teams/${poolId}`);
            setTeams(response.data);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data);
            } else {
                setError('Error fetching teams');
            }
        } finally {
            setLoading(false);
        }
    }, [poolId, user]);

    // Fetch players
    const fetchPlayers = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/pool/players/${poolId}`);
            setPlayers(response.data);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data);
            } else {
                setError('Error fetching players');
            }
        } finally {
            setLoading(false);
        }
    }, [poolId, user]);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    useEffect(() => {
        if (teams && Object.keys(teams).length > 0) {
            fetchPlayers();
        }
    }, [teams, fetchPlayers]);

    const handleTeamSelect = (teamId: string) => {
        setSelectedTeams((prev) =>
            prev.includes(teamId) ? prev.filter((t) => t !== teamId) : prev.length < 3 ? [...prev, teamId] : prev
        );
    };

    const handlePlayerSelect = (player: Player) => {
        if (selectedPlayers.length < 3) {
            setSelectedPlayers((prev) =>
                prev.find((p) => p.id === player.id) ? prev.filter((p) => p.id !== player.id) : [...prev, player]
            );
            setLimitReached(false);
        } else {
            setLimitReached(true);
        }
    };

    const handleRemovePlayer = (playerId: string) => {
        setSelectedPlayers((prev) => prev.filter((p) => p.id !== playerId));
        setLimitReached(false);
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/pool/user-selection`, {
                authId: user?.id,
                poolId,
                teams: selectedTeams,
                players: selectedPlayers.map((player) => player.id),
            });
            if (response.status !== 200) {
                throw new Error('Failed to save selection');
            }
            navigate(`/pool/view/${poolId}`);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen py-8 text-gray-800">
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-md shadow-md p-6">
                    <h2 className="text-3xl font-semibold text-gray-900 mb-6">Join Pool</h2>
                    {error && <p className="text-red-500 text-sm italic mb-4">{error}</p>}

                    <div className="mb-6">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Select Top 3 Teams</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {Object.entries(teams).map(([teamId, teamName]) => (
                                <div
                                    key={teamId}
                                    className={`p-4 rounded-md cursor-pointer transition-colors duration-200 hover:shadow-lg hover:scale-105 text-center ${selectedTeams.includes(teamId) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                                        }`}
                                    onClick={() => handleTeamSelect(teamId)}
                                >
                                    {countryFlags[teamName] || '🏳'} {teamName}
                                </div>
                            ))}
                        </div>
                    </div>

                    {selectedTeams.length === 3 && (
                        <div className="mb-6">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Select a Team to View Players</h3>
                            <Select
                                options={Object.entries(teams).map(([teamId, teamName]) => ({
                                    value: teamId,
                                    label: teamName,
                                }))}
                                onChange={(selectedOption) => {
                                    const selectedTeamName = (selectedOption as any).label;
                                    setDropdownTeam(selectedTeamName);
                                }}
                                className="text-gray-700"
                                classNames={{
                                    control: (state) => 'border border-gray-300 rounded-md',
                                    option: (state) => state.isFocused ? 'bg-blue-100' : '',
                                }}
                            />
                        </div>
                    )}

                    {dropdownTeam && (
                        <div className="mb-6">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Select Top 3 Players</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    { type: 'Batsmen', icon: <GiCricketBat /> },
                                    { type: 'Bowler', icon: <BiCricketBall /> },
                                    { type: 'All Rounder', icon: <FaRunning /> },
                                    { type: 'Wicket Keeper', icon: <GiGloves /> },
                                ].map(({ type, icon }) => (
                                    <div key={type}>
                                        <h4 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                                            {icon} <span className="ml-2">{type}</span>
                                        </h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {filteredPlayers
                                                .filter((player) => player.role === type)
                                                .map((player) => (
                                                    <div
                                                        key={player.id}
                                                        className={`p-4 rounded-md cursor-pointer transition-colors duration-200 hover:shadow-lg hover:scale-105 text-center ${selectedPlayers.some((p) => p.id === player.id) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                        onClick={() => handlePlayerSelect(player)}
                                                    >
                                                        {countryFlags[player.teamId]} {player.name}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {limitReached && (
                                <p className="text-red-500 text-sm italic mt-4">
                                    You have reached the limit of 3 players. Remove one to select another.
                                </p>
                            )}
                        </div>
                    )}

                    {selectedPlayers.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your Selection</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {selectedPlayers.map((player) => (
                                    <div
                                        key={player.id}
                                        className="p-4 rounded-md bg-gray-100 text-gray-800 flex justify-between items-center"
                                    >
                                        {countryFlags[player.teamId]} {player.name}
                                        <button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleRemovePlayer(player.id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedPlayers.length === 3 && selectedTeams.length === 3 && (
                        <div className="flex items-center justify-end">
                            <button
                                onClick={handleSave}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:shadow-outline"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <FaSpinner className="animate-spin mr-2" />
                                        Saving...
                                    </div>
                                ) : (
                                    'Save'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JoinPool;
