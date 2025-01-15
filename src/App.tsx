import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Portfolios from './pages/Portfolios';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Community from './pages/Community';
import ChallengeSubmission from './pages/ChallengeSubmission';
import CommunityChat from './pages/CommunityChat';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Home />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/portfolios"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Portfolios />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Upload />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Profile />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Analytics />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Community />
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/community/:communityId/chat"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <CommunityChat />
                  </>
                </ProtectedRoute>
              }
            />
            <Route path="/challenge/:challengeId/submit" element={<ChallengeSubmission />} />
            
            {/* Redirect all other routes to auth */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;