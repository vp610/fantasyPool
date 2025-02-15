import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pool } from '../../types';
import { dummyPools } from '../../data/pools'; // Replace with actual API data
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

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
    if (user){
      fetchPoolsForTournament();
    }
  }, [tournamentId]);

  const handleJoin = (poolId: string) => {
    navigate(`/pool/join/${poolId}`);  
  };

  const handleView = (poolId: string) => {
    navigate(`/pool/${poolId}`);
  }

  if (loading) return <div>Loading pools...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Pools for Tournament
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.length > 0 ? (
            pools.map(pool => (
              <div
                key={pool.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{pool.name}</h3>
                <p className="text-gray-600 mb-4">{pool.status ? 'Active' : 'Inactive'}</p>
                <p className="text-gray-500 mb-4">Participants: {pool.participants}</p>
                <p className="text-gray-500 mb-4">Ends on: {pool.endDate}</p>
                <button
                  onClick={() => handleJoin(pool.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
                >
                  Join Pool
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No pools are currently available for this tournament.</p>
          )}
        </div>
      </div>
    </div>
  );
}
