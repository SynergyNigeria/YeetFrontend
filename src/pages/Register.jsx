import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, MapPin, Globe, Eye, EyeOff, ChevronRight, ChevronLeft } from 'react-feather';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: '',
    residential_address: '',
    password: '',
    password_confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.first_name.trim()) {
          toast.error('Please enter your first name');
          return false;
        }
        if (!formData.last_name.trim()) {
          toast.error('Please enter your last name');
          return false;
        }
        return true;
      case 2:
        if (!formData.email.trim()) {
          toast.error('Please enter your email');
          return false;
        }
        if (!formData.phone.trim()) {
          toast.error('Please enter your phone number');
          return false;
        }
        if (!formData.country.trim()) {
          toast.error('Please enter your country');
          return false;
        }
        if (!formData.residential_address.trim()) {
          toast.error('Please enter your residential address');
          return false;
        }
        return true;
      case 3:
        if (!formData.password.trim()) {
          toast.error('Please enter a password');
          return false;
        }
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return false;
        }
        if (!formData.password_confirm.trim()) {
          toast.error('Please confirm your password');
          return false;
        }
        if (formData.password !== formData.password_confirm) {
          toast.error('Passwords do not match');
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(3)) {
      return;
    }

    setIsLoading(true);

    try {
      await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        residential_address: formData.residential_address,
        password: formData.password,
      });

      toast.success('Registration successful! Welcome notifications sent. Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
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

      <div className="w-full max-w-2xl relative z-10 animate-fade-in-scale">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
              <img src="/icons/yeet-icon.png" alt="Yeet Bank" className="w-14 h-14 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-[#2c3968] mb-2">Yeet Bank</h1>
            <p className="text-gray-600 font-light">Create your account and start banking</p>
          </div>

          {/* Header with Step Indicator (Mobile Only) */}
          <div className="md:hidden mb-6">
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    step <= currentStep ? 'bg-[#2c3968]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">
              Step {currentStep} of 3
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* MOBILE VIEW - Step Based Form */}
            <div className="md:hidden space-y-5">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-semibold text-[#2c3968] mb-4">Basic Information</h2>
                  </div>

                  {/* First Name */}
                  <div className="space-y-2">
                    <label htmlFor="first_name" className="label">First Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />
                      <input
                        id="first_name"
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="John"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2c3968] focus:ring-2 focus:ring-[#2c3968]/20 transition-all duration-200 bg-white/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label htmlFor="last_name" className="label">Last Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />
                      <input
                        id="last_name"
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Doe"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2c3968] focus:ring-2 focus:ring-[#2c3968]/20 transition-all duration-200 bg-white/50"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Contact & Location */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-semibold text-[#2c3968] mb-4">Contact & Location</h2>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="label">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2c3968] focus:ring-2 focus:ring-[#2c3968]/20 transition-all duration-200 bg-white/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="label">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2c3968] focus:ring-2 focus:ring-[#2c3968]/20 transition-all duration-200 bg-white/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <label htmlFor="country" className="label">Country</label>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />
                      <input
                        id="country"
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="United States"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2c3968] focus:ring-2 focus:ring-[#2c3968]/20 transition-all duration-200 bg-white/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Residential Address */}
                  <div className="space-y-2">
                    <label htmlFor="residential_address" className="label">Residential Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />
                      <input
                        id="residential_address"
                        type="text"
                        name="residential_address"
                        value={formData.residential_address}
                        onChange={handleChange}
                        placeholder="123 Main St"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2c3968] focus:ring-2 focus:ring-[#2c3968]/20 transition-all duration-200 bg-white/50"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Password */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <h2 className="text-lg font-semibold text-[#2c3968] mb-4">Security</h2>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="label">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
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

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label htmlFor="password_confirm" className="label">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />
                      <input
                        id="password_confirm"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="password_confirm"
                        value={formData.password_confirm}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2c3968] focus:ring-2 focus:ring-[#2c3968]/20 transition-all duration-200 bg-white/50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2c3968] transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={18} />
                    Back
                  </button>
                )}
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 py-3 bg-[#2c3968] text-white rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 bg-[#2c3968] text-white rounded-xl font-semibold hover:shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Creating...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* DESKTOP VIEW - Grid Layout */}
            <div className="hidden md:block">
              <div className="grid md:grid-cols-2 gap-5">
                {/* First Name */}
                <div className="space-y-2">
                  <label htmlFor="first_name" className="label">First Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />
                    <input
                      id="first_name"
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="John"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2c3968] focus:ring-2 focus:ring-[#2c3968]/20 transition-all duration-200 bg-white/50"
                      required
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label htmlFor="last_name" className="label">Last Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />
                    <input
                      id="last_name"
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Doe"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2c3968] focus:ring-2 focus:ring-[#2c3968]/20 transition-all duration-200 bg-white/50"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="label">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2c3968] focus:ring-2 focus:ring-[#2c3968]/20 transition-all duration-200 bg-white/50"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="label">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2c3968] focus:ring-2 focus:ring-[#2c3968]/20 transition-all duration-200 bg-white/50"
                      required
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <label htmlFor="country" className="label">Country</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />
                    <input
                      id="country"
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="United States"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2c3968] focus:ring-2 focus:ring-[#2c3968]/20 transition-all duration-200 bg-white/50"
                      required
                    />
                  </div>
                </div>

                {/* Residential Address */}
                <div className="space-y-2">
                  <label htmlFor="residential_address" className="label">Residential Address</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />
                    <input
                      id="residential_address"
                      type="text"
                      name="residential_address"
                      value={formData.residential_address}
                      onChange={handleChange}
                      placeholder="123 Main St"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2c3968] focus:ring-2 focus:ring-[#2c3968]/20 transition-all duration-200 bg-white/50"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="label">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="password_confirm" className="label">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2c3968] transition-colors" size={18} />
                    <input
                      id="password_confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="password_confirm"
                      value={formData.password_confirm}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#2c3968] focus:ring-2 focus:ring-[#2c3968]/20 transition-all duration-200 bg-white/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2c3968] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#2c3968] text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-5"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
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

          {/* Login Link */}
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              Already have an account?{' '}
              <Link to="/login" className="text-[#2c3968] font-bold hover:underline transition-colors">
                Login here
              </Link>
            </p>
            <Link 
              to="/" 
              className="inline-block text-[#2c3968] text-sm hover:underline transition-colors font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-white/50 text-xs mt-6 font-light">
          By creating an account, you agree to our Terms & Conditions
        </p>
      </div>
    </div>
  );
};

export default Register;
