import React, { useEffect, useState } from 'react';
import { User } from '../../types';
import { dummyUsers } from '../../data/users';
import { useParams } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User>(); // Replace with actual user data
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user data from the backend
    // const fetchUser = async () => {
    //   const response = await fetch(`/api/users/${userId}`);
    //   if (!response.ok) {
    //     throw new Error('Failed to fetch user');
    //   }
    //   const userData = await response.json();
    //   setUser(userData);
    // };
    // fetchUser();

    // Simulate successful fetch
    setTimeout(() => {
      const fetchedUser = dummyUsers[0];
      setUser(fetchedUser);
      setName(fetchedUser.username);
      setImage(fetchedUser.image);
    }, 1000);
  }, [ userId ]);

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
      // Update user data in the backend
      // const response = await fetch('/api/update-profile', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ id: user.id, username: name, image }),
      // });
      // if (!response.ok) {
      //   throw new Error('Failed to update profile');
      // }
      // const updatedUser = await response.json();
      // setUser(updatedUser);

      // Simulate successful update
      setTimeout(() => {
        if (user) {
          setUser({ ...user, username: name, image });
        }
        setLoading(false);
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
              Profile Picture
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {image && (
              <img src={image} alt="Profile" className="mt-4 w-32 h-32 rounded-full object-cover" />
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user?.email}
              readOnly
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 cursor-not-allowed"
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;