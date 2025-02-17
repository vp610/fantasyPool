import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Dashboard/Header';
import { AuthPage } from './components/Auth/AuthPage';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { PoolPage } from './components/Pool/PoolPage';
import ProfilePage from './components/Profile/ProfilePage';
import JoinPool from './components/Pool/JoinPool';
import { TournamentPage } from './components/Tournament/TournamentPage';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ThemeProvider>
        <Header />
        <Routes>
        <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/tournament/:tournamentId"
            element={
              <ProtectedRoute>
                <TournamentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pool/view/:poolId"
            element={
              <ProtectedRoute>
                <PoolPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pool/join/:poolId"
            element={
              <ProtectedRoute>
                <JoinPool />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Routes>  
      </ThemeProvider>
      
    </div>
  );
}

export default App;