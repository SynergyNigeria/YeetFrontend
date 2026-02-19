import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Phone, CreditCard } from 'react-feather';

const Login = () => {
  const [loginMethod, setLoginMethod] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(identifier, password);
      toast.success('Welcome back! Check your notifications for updates.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2c3968] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-scale">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
              <img src="/icons/yeet-icon.png" alt="Yeet Bank" className="w-14 h-14 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-[#2c3968] mb-2 hidden">Yeet Bank</h1>
            <p className="text-gray-600 font-light hidden">Welcome back to your banking</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Login Method Tabs */}
            <div className="space-y-2">
              <div className="block text-sm font-semibold text-[#2c3968]">Login Method</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 ${
                    loginMethod === 'email'
                      ? 'bg-[#2c3968] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Mail size={16} className="inline mr-1" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 ${
                    loginMethod === 'phone'
                      ? 'bg-[#2c3968] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Phone size={16} className="inline mr-1" />
                  Phone
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('account')}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 ${
                    loginMethod === 'account'
                      ? 'bg-[#2c3968] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <CreditCard size={16} className="inline mr-1" />
                  Account
                </button>
              </div>
            </div>

            {/* Identifier Field */}
            <div className="space-y-2">
              <label htmlFor="identifier" className="label">
                {loginMethod === 'email' && 'Email Address'}
                {loginMethod === 'phone' && 'Phone Number'}
                {loginMethod === 'account' && 'Account Number'}
              </label>
              <div className="relative group">
                {loginMethod === 'email' && <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />}
                {loginMethod === 'phone' && <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />}
                {loginMethod === 'account' && <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />}
                <input
                  id="identifier"
                  name="identifier"
                  type={loginMethod === 'email' ? 'email' : 'text'}
                  inputMode={loginMethod === 'email' ? 'email' : 'numeric'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    loginMethod === 'email'
                      ? 'you@example.com'
                      : loginMethod === 'phone'
                      ? '+1234567890'
                      : '1234567890'
                  }
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2c3968] focus:ring-2 focus:ring-[#2c3968]/20 transition-all duration-200 bg-white/50"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="label">Password</label>
                <a href="#" className="text-sm text-[#2c3968] hover:underline font-medium">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2c3968] focus:ring-2 focus:ring-[#2c3968]/20 transition-all duration-200 bg-white/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2c3968] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#2c3968] text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/95 text-gray-500 font-light">OR</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#2c3968] font-bold hover:underline transition-colors">
                Create one
              </Link>
            </p>
            <Link 
              to="/" 
              className=" text-[#2c3968] text-sm hover:underline transition-colors font-medium hidden"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-white/50 text-xs mt-6 font-light">
          Your security is our priority. All data is encrypted.
        </p>
      </div>
    </div>
  );
};

export default Login;
