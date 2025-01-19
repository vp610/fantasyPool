import React, { useEffect, useState } from 'react';
import { PoolCard } from './PoolCard';
import { dummyPools } from '../../data/pools';
import { Pool } from '../../types';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPools = async () => {
      try {
        // const { data, error } = await supabase.from('pools').select('*');
        // if (error) throw error;
        // setPools(data);
        setTimeout(() => {
          setPools(dummyPools);
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

    fetchPools();
  }, []);

  const userPartOfPool = (poolId: number) => {
    // Implement user part of pool logic
    return true;
  };

  const handleJoin = (poolId: string) => {
    // Implement join pool logic
    navigate(`/pool/join/${poolId}`);
    // console.log(`Joining pool with ID: ${poolId}`);
  };

  const handleView = (poolId: string) => {
    // Implement view pool logic
    navigate(`/pool/view/${poolId}`);
    // console.log(`Viewing pool with ID: ${poolId}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Available Pools</h2>
          <p className="text-lg text-gray-600">Join a pool and compete with others!</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map((pool) => (
            <div
              key={pool.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{pool.name}</h3>
              <p className="text-gray-600 mb-4">{pool.status}</p>
              <p className="text-gray-500 mb-4">Participants: {pool.participants}</p>
              <p className="text-gray-500 mb-4">Ends on: {pool.endDate}</p>
              <div className="flex justify-between items-center">
                {userPartOfPool(Number(pool.id)) ? (
                  <button
                    onClick={() => handleView(pool.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
                  >
                    View Pool
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoin(pool.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
                  >
                    Join Pool
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};