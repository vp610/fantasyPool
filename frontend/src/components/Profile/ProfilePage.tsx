import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<User>(); // Replace with actual user data
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/${user?.id}`);
        setUserData(response.data);
      } catch (err) {
        if (axios.isAxiosError(err as any) && (err as any).response) {
          setError((err as any).response.data);
        } else {
          setError('Error fetching user');
        }
      }
    };

    fetchUser();
  }, [user]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/update/${userData?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: name }),
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      const updatedUser = await response.json();
      setUserData(updatedUser);

      setTimeout(() => {
        if (userData) {
          setUserData({ ...userData, username: name });
        }
        setLoading(false);
      }, 1000);
      setTimeout(() => {
        navigate(`/`);
      }, 1000);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen py-8 text-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
          <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center">
            <FaUser className="mr-3 text-blue-500" />
            Profile
          </h2>

          {/* Fade-in Profile Data */}
          <div className={`transition-opacity duration-500 ${userData ? 'opacity-100' : 'opacity-0'}`}>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  defaultValue={userData?.username}
                  onChange={handleNameChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <div className="flex items-center">
                  <FaEnvelope className="mr-2 text-gray-500" />
                  <input
                    type="email"
                    id="email"
                    value={userData?.email}
                    readOnly
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

              {/* Smooth Button Animation */}
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Updating...
                    </div>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
