import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Please enter your email.');
    setLoading(true);
    setNotFound(false);
    try {
      const res = await authApi.forgotPassword(email.trim().toLowerCase());
      if (res.found === false) {
        setNotFound(true);
      } else {
        setSent(true);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏦</div>
          <h1 className="text-2xl font-bold text-gray-800">YEET Bank</h1>
          <p className="text-gray-500 text-sm mt-1">Forgot your password?</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Check your inbox</h2>
            <p className="text-gray-500 text-sm mb-6">
              A password reset link has been sent to <strong>{email}</strong>. It expires in&nbsp;1&nbsp;hour.
            </p>
            <Link
              to="/login"
              className="inline-block text-indigo-600 font-medium hover:underline text-sm"
            >
              ← Back to Login
            </Link>
          </div>
        ) : notFound ? (
          <div className="text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No account found</h2>
            <p className="text-gray-500 text-sm mb-6">
              We couldn't find an account linked to <strong>{email}</strong>. Double-check the email or create a new account.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setNotFound(false); }}
                className="w-full py-2 border border-indigo-400 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-50 transition"
              >
                Try a different email
              </button>
              <Link
                to="/register"
                className="w-full py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl text-sm font-semibold text-center hover:opacity-90 transition"
              >
                Create an account
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-600 text-sm mb-6 text-center">
              Enter the email address linked to your account and we'll send you a reset
              link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Remembered it?{' '}
              <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
