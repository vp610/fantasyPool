import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEnvelope, FaSpinner } from 'react-icons/fa';

const ProfilePage: React.FC = () => {
    const { authId } = useParams<{ authId: string }>();
    const [user, setUser] = useState<User>();
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authId) {
            setError('authId is undefined');
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/${authId}`);
                setUser(response.data);
            } catch (err) {
                if (axios.isAxiosError(err as any) && (err as any).response) {
                    setError((err as any).response.data);
                } else {
                    setError('Error fetching user');
                }
            }
        };

        fetchUser();
    }, [authId]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && event.target.result) {
                    setImage(event.target.result as string);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/profile/update/${user?.id}`, {
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
            setUser(updatedUser);

            setTimeout(() => {
                if (user) {
                    setUser({ ...user, username: name });
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
        <div className="bg-gray-100 min-h-screen py-8 text-gray-800">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto bg-white rounded-md shadow-md p-6">
                    <h2 className="text-3xl font-semibold text-gray-900 mb-6 flex items-center">
                        <FaUser className="mr-3 text-blue-500" />
                        Profile
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                defaultValue={user?.username}
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
                                    value={user?.email}
                                    readOnly
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                        <div className="flex items-center justify-end">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:shadow-outline"
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
    );
};

export default ProfilePage;
