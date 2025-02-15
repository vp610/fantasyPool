import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';

export function AuthPage() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Cricket Pool
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join exciting cricket pools and compete with others
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => loginWithRedirect({ screen_hint: 'login' })}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}