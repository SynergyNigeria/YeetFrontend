import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './assets/styles/index.css';

// Context
import { AuthProvider, AuthContext } from './context/AuthContext';

// Pages
import Splash from './pages/Splash';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import YeetTransfer from './pages/YeetTransfer';
import WireTransfer from './pages/WireTransfer';
import ExternalTransfer from './pages/ExternalTransfer';
import Chat from './pages/Chat';
import Admin from './pages/Admin';
import Settings from './pages/Settings';

// Components
import PrivateRoute from './components/Common/PrivateRoute';
import AdminRoute from './components/Common/AdminRoute';

// Splash Screen Wrapper Component
function AppRouter() {
  const { isLoading, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Show splash screen for at least 5 seconds on initial load
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => clearTimeout(splashTimer);
  }, []);

  // Navigate after splash completes and auth check is done (only once)
  useEffect(() => {
    if (!showSplash && !isLoading && !hasInitialized) {
      setHasInitialized(true);
      if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [showSplash, isLoading, hasInitialized, isAuthenticated, navigate]);

  // Show splash screen while loading or during initial 5-second display
  if (isLoading || showSplash) {
    return <Splash />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/yeet-transfer" element={<YeetTransfer />} />
          <Route path="/wire-transfer" element={<WireTransfer />} />
          <Route path="/external-transfer" element={<ExternalTransfer />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRouter />

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            className: '',
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
