import React, { useState, useEffect } from 'react';

// Backend Connection Status Component
// Add this component temporarily to any page to check backend connection
const BackendStatus = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        // Try to make a simple API call to check if backend is accessible
        const response = await fetch(process.env.REACT_APP_API_URL || 'http://localhost:8000');
        if (response.ok || response.status === 404) {
          // Backend is running (404 is fine, means server is up but endpoint doesn't exist)
          setStatus('connected');
        } else {
          setStatus('error');
          setError(`Server responded with status: ${response.status}`);
        }
      } catch (err) {
        setStatus('error');
        setError(`Connection failed: ${err.message}`);
      }
    };

    checkBackendConnection();
  }, []);

  const statusColors = {
    checking: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    connected: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300'
  };

  const statusMessages = {
    checking: 'Checking backend connection...',
    connected: `✅ Backend connected: ${process.env.REACT_APP_API_URL || 'http://localhost:8000'}`,
    error: `❌ Backend connection failed: ${error}`
  };

  return (
    <div className={`fixed top-4 right-4 p-3 border rounded-lg shadow-lg z-50 ${statusColors[status]}`}>
      <div className="font-medium text-sm">
        {statusMessages[status]}
      </div>
      {error && (
        <div className="text-xs mt-1">
          Make sure your backend server is running on port 8000
        </div>
      )}
    </div>
  );
};

export default BackendStatus;