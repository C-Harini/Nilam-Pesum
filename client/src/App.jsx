import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VoiceProvider } from './context/VoiceContext';
import { FieldProvider } from './context/FieldContext';

import Navbar from './components/common/Navbar';
import BottomNav from './components/common/BottomNav';

import WelcomeLogin from './pages/WelcomeLogin';
import VoiceOnboarding from './pages/VoiceOnboarding';
import FieldToday from './pages/FieldToday';
import RotationPlan from './pages/RotationPlan';
import SeasonCompanion from './pages/SeasonCompanion';
import TimeMachinePage from './pages/TimeMachinePage';
import TalkPage from './pages/TalkPage';
import DataCheckPage from './pages/DataCheckPage';
import SourcesCreditsPage from './pages/SourcesCreditsPage';
import ExtensionOfficer from './pages/ExtensionOfficer';
import FarmGamePage from './pages/FarmGamePage';

function AppLayout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/onboarding' || location.pathname === '/game';

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col font-sans selection:bg-wheat-200">
      {!isAuthPage && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!isAuthPage && <BottomNav />}
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-xs text-soil-600">Loading Farm State...</div>;
  }
  // Allow demo bypass even if user is guest
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <VoiceProvider>
        <FieldProvider>
          <Router>
            <AppLayout>
              <Routes>
                <Route path="/login" element={<WelcomeLogin />} />
                <Route path="/onboarding" element={<VoiceOnboarding />} />
                <Route path="/today" element={<ProtectedRoute><FieldToday /></ProtectedRoute>} />
                <Route path="/plan" element={<ProtectedRoute><RotationPlan /></ProtectedRoute>} />
                <Route path="/season" element={<ProtectedRoute><SeasonCompanion /></ProtectedRoute>} />
                <Route path="/timemachine" element={<ProtectedRoute><TimeMachinePage /></ProtectedRoute>} />
                <Route path="/game" element={<ProtectedRoute><FarmGamePage /></ProtectedRoute>} />
                <Route path="/talk" element={<ProtectedRoute><TalkPage /></ProtectedRoute>} />
                <Route path="/data-check" element={<DataCheckPage />} />
                <Route path="/sources" element={<SourcesCreditsPage />} />
                <Route path="/extension" element={<ExtensionOfficer />} />
                <Route path="*" element={<Navigate to="/today" replace />} />
              </Routes>
            </AppLayout>
          </Router>
        </FieldProvider>
      </VoiceProvider>
    </AuthProvider>
  );
}
