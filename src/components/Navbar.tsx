import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Home,
  Layout,
  BarChart2,
  Users,
  LogOut,
  User,
  Upload,
  Sparkles,
  Code
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [portfolioCount, setPortfolioCount] = useState(0);

  // Define navItems array
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/portfolios', icon: Layout, label: 'Portfolios' },
    { path: '/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/community', icon: Users, label: 'Community' },
  ];

  useEffect(() => {
    if (user) {
      const fetchPortfolioCount = async () => {
        const q = query(
          collection(db, 'portfolios'), 
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        setPortfolioCount(snapshot.size);
      };

      fetchPortfolioCount();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <>
      {/* Top Navigation - Desktop */}
      <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="relative bg-black p-2 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-white border-2 border-black rounded-full" />
              </div>
              <span className="text-xl font-bold text-black tracking-tight">
                SkillFolio
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user && (
                <>
                  <Link to="/upload">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition"
                    >
                      <Upload className="h-5 w-5" />
                      <span>Upload Portfolio</span>
                    </motion.button>
                  </Link>
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">{user.displayName || user.email}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                      {portfolioCount} portfolios
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-red-600 transition"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </motion.button>
                </>
              )}
              {!user && (
                <Link to="/auth">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition"
                  >
                    Sign In
                  </motion.button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center space-y-1 ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Add padding to the bottom of the page content for mobile */}
      <div className="md:hidden h-16" />
    </>
  );
}