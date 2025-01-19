import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { FaTrophy, FaSignOutAlt } from 'react-icons/fa';
import { setGradientIndex } from '../../store/colorSlice';
import { gradients } from '../../constants/constants';
import { RootState } from '../../store/store';


export function Header() {
  const { logout, isAuthenticated } = useAuth0();
  const dispatch = useDispatch();
  const gradientIndex = useSelector((state: RootState) => state.color.gradientIndex);

  const handleTrophyClick = () => {
    const newIndex = (gradientIndex + 1) % gradients.length;
    dispatch(setGradientIndex(newIndex));
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
                <a href="/" className="hover:text-green-200 transition duration-300 ease-in-out transform hover:scale-110">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-200 transition duration-300 ease-in-out transform hover:scale-110">
                  My Pools
                </a>
              </li>
              <li>
                <a href="/profile/:userId" className="hover:text-green-200 transition duration-300 ease-in-out transform hover:scale-110">
                  Profile
                </a>
              </li>
              {isAuthenticated && (
                <li>
                  <a
                    href="/auth"
                    onClick={() => logout()}
                    className="flex items-center hover:text-green-200 transition duration-300 ease-in-out transform hover:scale-110"
                  >
                    Logout
                    <FaSignOutAlt className="ml-2" />
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}