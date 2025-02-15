import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaSignOutAlt } from 'react-icons/fa';
import { supabase } from '../../db/supabase';
import { setGradientIndex } from '../../store/colorSlice';
import { gradients } from '../../constants/constants';
import { RootState } from '../../store/store';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const { user, loading } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const gradientIndex = useSelector((state: RootState) => state.color.gradientIndex);

  const handleTrophyClick = () => {
    const newIndex = (gradientIndex + 1) % gradients.length;
    dispatch(setGradientIndex(newIndex));
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [loading, user, navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className={`bg-gradient-to-r ${gradients[gradientIndex]} text-white shadow-lg`}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaTrophy
              className="h-8 w-8 cursor-pointer text-white animate-bounce"
              onClick={handleTrophyClick}
            />
            <h1 className="text-2xl font-bold tracking-wide">Cricket Pool</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a
                  href="/"
                  className="hover:text-green-200 transition duration-300 ease-in-out transform hover:scale-110"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-green-200 transition duration-300 ease-in-out transform hover:scale-110"
                >
                  My Pools
                </a>
              </li>
              <li>
                <a
                  href={`/profile/${user?.id}`}
                  className="hover:text-green-200 transition duration-300 ease-in-out transform hover:scale-110"
                >
                  Profile
                </a>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center hover:text-green-200 transition duration-300 ease-in-out transform hover:scale-110"
                >
                  Logout
                  <FaSignOutAlt className="ml-2" />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
