import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PoolCard } from './PoolCard';
import { dummySports } from '../../data/sports'; 
import { Pool, Sport, Tournament } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

export function Dashboard() {
  const { user } = useAuth();
  const [userPools, setUserPools] = useState<Pool[]>([]);
  const [tournaments, setTournaments] = useState<{ [key: string]: Tournament[] }>({});
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
  
    const fetchUserPools = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/pools/${user?.id}`);
        const transformedPools = response.data.map((item: any) => item.pools);
        setUserPools(transformedPools);
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
  
    fetchUserPools();
  }, [user]); 
  

  const handleSportFilter = async (sportName: string) => {
    setSelectedSport(sportName);
    
    if (Object.keys(tournaments).length === 0) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/tournaments/${user?.id}`);
        const fetchedTournaments = response.data;
        setTournaments(fetchedTournaments);
        
        const filtered = fetchedTournaments[sportName] || [];
        setFilteredTournaments(filtered);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          setError(err.response.data);
        } else {
          setError('Error fetching tournaments');
        }
      }
    } else {
      const filtered = tournaments[sportName] || [];
      setFilteredTournaments(filtered);
    }
  };
  
  const handleDelete = async (poolId: string) => {
    if (!user) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/pool/${poolId}/${user?.id}`);
      const updatedPools = userPools.filter(pool => pool.id !== poolId);
      setUserPools(updatedPools);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data);
      } else {
        setError('Error deleting pool');
      }
    }
  }

  const handleViewPool = (poolId: string) => {
    navigate(`/pool/view/${poolId}`);
  };

  const handleViewTournament = (tournamentId: string) => {
    navigate(`/tournament/${tournamentId}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-600">
              Welcome to Cricket Pool!
            </span>
          </h1>
          <p className="text-lg text-gray-700 italic">
            Compete in tournaments, join pools, and do not show off your sports knowledge!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Pools Section */}
          <div>
            <h2 className="text-3xl font-bold mb-4">Your Pools</h2>
            <div className="space-y-4">
              {userPools.length > 0 ? (
                userPools.map(pool => (
                  <PoolCard
                    key={pool.id}
                    pool={pool}
                    onView={handleViewPool}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <p className="text-gray-600">You are not part of any pools yet.</p>
              )}
            </div>
          </div>

          {/* Sports and Tournaments Section */}
          <div>
            <h2 className="text-3xl font-bold mb-4">Find Tournaments</h2>
            <div className="mb-6">
              <select
                className="w-full px-4 py-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-400"
                onChange={e => handleSportFilter(e.target.value)}
              >
                <option value="">Select a Sport</option>
                {dummySports.map(sport => (
                  <option key={sport.id} value={sport.name}>
                    {sport.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-4">
              {filteredTournaments.length > 0 ? (
                filteredTournaments.map(tournament => (
                  <div
                    key={tournament.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
                    onClick={() => handleViewTournament(tournament.id)}
                  >
                    <h3 className="text-2xl font-bold text-gray-800">{tournament.name}</h3>
                    <p className="text-gray-500">Starts: {new Date(tournament.startDate).toLocaleDateString()}</p>
                    <p className="text-gray-500">Ends: {new Date(tournament.endDate).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No tournaments available for the selected sport.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
