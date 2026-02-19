import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, Zap, Shield, Smartphone, TrendingUp, Users } from 'react-feather';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/10">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <img src="/icons/yeet-icon.png" alt="Yeet Bank" className="w-8 h-8 object-contain" />
            <span className="text-2xl font-bold text-[#2c3968]">
              Yeet Bank
            </span>
          </div>
          <div className="flex gap-3">
            <Link 
              to="/login" 
              className="px-5 py-2 text-[#2c3968] font-medium hover:bg-gray-100/50 rounded-lg transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 bg-[#2c3968] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen bg-white flex items-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 text-center relative z-10 w-full">
          <div className="animate-slide-in-down mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium text-sm">
              ✨ Modern Banking Experience
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-[#2c3968] mb-6 leading-tight animate-slide-in-down animation-delay-200">
            Banking for the
            <br />
            <span className="text-[#2c3968]">
              Modern Era
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-slide-in-down animation-delay-400">
            Experience the future of banking with our cutting-edge financial simulation platform. Fast, secure, and intuitive.
          </p>

          <div className="flex gap-4 justify-center mb-16 animate-slide-in-down animation-delay-600">
            <Link
              to="/register"
              className="px-8 py-4 bg-[#2c3968] text-white rounded-xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center gap-2 inline-flex"
            >
              Get Started <ArrowRight size={20} />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-gray-300 text-[#2c3968] rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              Login
            </Link>
          </div>

          {/* Hero Image Placeholder with Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-fade-in-scale animation-delay-800">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Zap className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#2c3968] mb-2">Lightning Fast</h3>
              <p className="text-gray-600 font-light">Transactions processed instantly with cutting-edge technology</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Shield className="text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#2c3968] mb-2">Bank-Grade Security</h3>
              <p className="text-gray-600 font-light">Your data is encrypted with military-grade protocols</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Smartphone className="text-purple-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#2c3968] mb-2">Always Connected</h3>
              <p className="text-gray-600 font-light">Access your account anytime, anywhere, on any device</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[#2c3968] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Why Choose Yeet Bank?</h2>
            <p className="text-white/80 text-xl font-light max-w-2xl mx-auto">
              Everything you need for modern banking, all in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Real-Time Analytics",
                description: "Monitor your spending and savings with detailed insights and visualizations"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "P2P Transfers",
                description: "Send money to friends instantly with just their account number or phone"
              },
              {
                icon: <Lock className="w-8 h-8" />,
                title: "Advanced Security",
                description: "Two-factor authentication and biometric login for maximum protection"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Smart Notifications",
                description: "Get instant alerts for all transactions and important account changes"
              },
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "Mobile First",
                description: "Fully optimized for mobile with a seamless experience on all devices"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "24/7 Support",
                description: "Round-the-clock customer support and chat assistance for your queries"
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 hover:border-white/40 transition-all duration-300 group"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/70 font-light">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2c3968] text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-white/80 mb-8 font-light">
            Join thousands of users who trust Yeet Bank for their financial needs
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#2c3968] rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Create Your Account <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1f3a] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg mb-4">
                <img src="/icons/yeet-icon.png" alt="Yeet Bank" className="w-6 h-6 object-contain" />
                Yeet Bank
              </div>
              <p className="text-gray-400 text-sm font-light">Modern banking for the digital age</p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400 font-light">
                <li><span className="hover:text-white transition cursor-pointer">Features</span></li>
                <li><span className="hover:text-white transition cursor-pointer">Security</span></li>
                <li><span className="hover:text-white transition cursor-pointer">Pricing</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400 font-light">
                <li><span className="hover:text-white transition cursor-pointer">About</span></li>
                <li><span className="hover:text-white transition cursor-pointer">Blog</span></li>
                <li><span className="hover:text-white transition cursor-pointer">Careers</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400 font-light">
                <li><span className="hover:text-white transition cursor-pointer">Privacy</span></li>
                <li><span className="hover:text-white transition cursor-pointer">Terms</span></li>
                <li><span className="hover:text-white transition cursor-pointer">Contact</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-400 text-sm font-light">
              © 2026 Yeet Bank. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
