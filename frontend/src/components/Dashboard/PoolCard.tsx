import React, { useEffect } from 'react';
import { Pool } from '../../types';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { gradientClasses } from '../../constants/constants';

interface PoolCardProps {
  pool: Pool;
  onJoin: (poolId: string) => void;
  onView: (poolId: string) => void;
  isUserPartOfPool: boolean;
}

export const PoolCard: React.FC<PoolCardProps> = ({ pool, onJoin, onView, isUserPartOfPool }) => {
  const gradientIndex = useSelector((state: RootState) => state.color.gradientIndex);
  
  useEffect(() => {
  }, [gradientIndex]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <h3 className="text-xl font-bold text-gray-800">{pool.name}</h3>
      <p className="text-gray-600 mt-2">Status: {pool.status}</p>
      <p className="text-gray-600 mt-2">Start Date: {new Date(pool.startDate).toLocaleDateString()}</p>
      <p className="text-gray-600 mt-2">End Date: {new Date(pool.endDate).toLocaleDateString()}</p>
      <p className="text-gray-600 mt-2">Participants: {pool.participants}</p>
      <div className="mt-4">
        {isUserPartOfPool ? (
          <button
            onClick={() => onView(pool.id)}
            className={`py-2 px-5 border rounded-lg cursor-pointer ${
              `${gradientClasses[gradientIndex]} text-white`
            } transition-colors duration-200`}          >
            View
          </button>
        ) : (
          <button
            onClick={() => onJoin(pool.id)}
            className={`py-2 px-5 border rounded-lg cursor-pointer ${
              `${gradientClasses[gradientIndex]} text-white`
            } transition-colors duration-200`}
          >
            Join
          </button>
        )}
      </div>
    </div>
  );
};