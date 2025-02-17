import React from 'react';
import { Pool } from '../../types';

interface PoolCardProps {
    pool: Pool;
    onView: (poolId: string) => void;
    onDelete: (poolId: string) => void;
}

export const PoolCard: React.FC<PoolCardProps> = ({ pool, onView, onDelete }) => {
    return (
        <div className="bg-white rounded-md shadow-md p-6 mb-4">
            <h3 className="text-xl font-bold text-gray-800">{pool.name}</h3>
            <p className="text-gray-600 mt-2">Status: {pool.status ? 'Active' : 'Inactive'}</p>
            <p className="text-gray-600 mt-2">Start Date: {new Date(pool.startDate).toLocaleDateString()}</p>
            <p className="text-gray-600 mt-2">End Date: {new Date(pool.endDate).toLocaleDateString()}</p>
            <div className="mt-4">
                <button
                    onClick={() => onView(pool.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md mr-2 transition-colors duration-200"
                >
                    View
                </button>
                <button
                    onClick={() => onDelete(pool.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                >
                    Remove
                </button>
            </div>
        </div>
    );
};
