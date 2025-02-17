import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PoolCard } from './PoolCard';
import { dummySports } from '../../data/sports';
import { Pool, Tournament } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { FaTrophy, FaSearch, FaSpinner } from 'react-icons/fa';

export function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [userPools, setUserPools] = useState<Pool[]>([]);
  const [tournaments, setTournaments] = useState<{ [key: string]: Tournament[] }>({});
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [poolsLoading, setPoolsLoading] = useState(true);
  const [tournamentsLoading, setTournamentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const globalLoading = authLoading || poolsLoading || tournamentsLoading;

  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/auth');
      return;
    }

    const fetchUserPools = async () => {
      setPoolsLoading(true);
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
        setPoolsLoading(false);
      }
    };

    if (user) {
      fetchUserPools();
    }
  }, [user, authLoading, navigate]);

  const handleSportFilter = async (sportName: string) => {
    setSelectedSport(sportName);

    if (Object.keys(tournaments).length === 0) {
      setTournamentsLoading(true);
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
      } finally {
        setTournamentsLoading(false);
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
  };

  const handleViewPool = (poolId: string) => {
    navigate(`/pool/view/${poolId}`);
  };

  const handleViewTournament = (tournamentId: string) => {
    navigate(`/tournament/${tournamentId}`);
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8 text-gray-800 relative">
      {globalLoading && (
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-gray-100 bg-opacity-75 z-50">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
          {/* <p className="text-xl text-gray-700">Loading...</p> */}
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4 text-gray-900">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Fantasy Pool HQ
            </span>
          </h1>
          <p className="text-xl text-gray-600 italic">
            Compete in tournaments, join pools, and enjoy the party!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Pools Section */}
          <div className="bg-white rounded-md shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-900">
              <FaTrophy className="mr-3 text-yellow-500" />
              Your Active Pools
            </h2>
            <div className="space-y-4">
              {!globalLoading && userPools.length > 0 ? (
                userPools.map(pool => (
                  <PoolCard
                    key={pool.id}
                    pool={pool}
                    onView={handleViewPool}
                    onDelete={handleDelete}
                  />
                ))
              ) : !globalLoading ? (
                <p className="text-gray-600">You are not part of any pools yet.</p>
              ) : null}
            </div>
          </div>

          {/* Sports and Tournaments Section */}
          <div className="bg-white rounded-md shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-900">
              <FaSearch className="mr-3 text-blue-500" />
              Discover Tournaments
            </h2>
            <div className="mb-6">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-blue-400"
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
              {!globalLoading && filteredTournaments.length > 0 ? (
                filteredTournaments.map(tournament => (
                  <div
                    key={tournament.id}
                    className="bg-gray-50 hover:bg-gray-100 rounded-md shadow-md p-4 cursor-pointer transition-colors duration-300"
                    onClick={() => handleViewTournament(tournament.id)}
                  >
                    <h3 className="text-xl font-bold text-gray-800">{tournament.name}</h3>
                    <p className="text-gray-500">Starts: {new Date(tournament.startDate).toLocaleDateString()}</p>
                    <p className="text-gray-500">Ends: {new Date(tournament.endDate).toLocaleDateString()}</p>
                  </div>
                ))
              ) : !globalLoading ? (
                <p className="text-gray-600">No tournaments available for the selected sport.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
