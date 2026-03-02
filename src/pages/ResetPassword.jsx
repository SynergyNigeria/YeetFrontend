import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isValidLink = uid && token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters.');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    setLoading(true);
    try {
      await authApi.resetPassword(uid, token, newPassword);
      setSuccess(true);
      toast.success('Password reset! Redirecting to login…');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        'Reset failed. The link may have expired — please request a new one.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏦</div>
          <h1 className="text-2xl font-bold text-gray-800">YEET Bank</h1>
          <p className="text-gray-500 text-sm mt-1">Choose a new password</p>
        </div>

        {!isValidLink ? (
          <div className="text-center">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Invalid link</h2>
            <p className="text-gray-500 text-sm mb-6">
              This password-reset link is missing required information. Please request a
              new one.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block text-indigo-600 font-medium hover:underline text-sm"
            >
              Request new reset link
            </Link>
          </div>
        ) : success ? (
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Password updated!
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Your password has been reset successfully. Redirecting you to login…
            </p>
            <Link
              to="/login"
              className="inline-block text-indigo-600 font-medium hover:underline text-sm"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Reset Password'}
            </button>

            <p className="text-center text-sm text-gray-500">
              <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                ← Back to Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
