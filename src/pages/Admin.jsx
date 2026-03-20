import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock } from 'react-feather';

const Admin = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !user.is_staff) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user?.is_staff) return null;

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#2c3968]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={32} className="text-[#2c3968]" />
        </div>
        <h1 className="text-2xl font-bold text-[#2c3968] mb-2">Admin Panel</h1>
        <p className="text-gray-500 mb-6">
          Manage users, verify IFSC codes, and configure account settings via the Django admin interface.
        </p>
        <a
          href={`${API_URL}/admin/`}
          target="_blank"
          rel="noreferrer"
          className="block w-full bg-[#2c3968] hover:bg-[#1e2b4a] text-white font-semibold py-3 rounded-xl transition-all mb-3"
        >
          Open Django Admin
        </a>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Admin;
