import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SpaceProvider } from './context/SpaceContext.jsx';

import { AuthLayout } from './layouts/AuthLayout.jsx';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';

import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { SpacesPage } from './pages/SpacesPage.jsx';
import { SpaceDetailPage } from './pages/SpaceDetailPage.jsx';
import { DocumentsPage } from './pages/DocumentsPage.jsx';
import { DocumentReaderPage } from './pages/DocumentReaderPage.jsx';
import { ChatPage } from './pages/ChatPage.jsx';
import { StudyPage } from './pages/StudyPage.jsx';
import { ComparePage } from './pages/ComparePage.jsx';
import { NotesPage } from './pages/NotesPage.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { TeamPage } from './pages/TeamPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 text-xs">
        Verifying session...
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SpaceProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Marketing Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Authentication Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Protected Application Workspace */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="spaces" element={<SpacesPage />} />
                <Route path="spaces/:id" element={<SpaceDetailPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="reader/:id" element={<DocumentReaderPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="study" element={<StudyPage />} />
                <Route path="compare" element={<ComparePage />} />
                <Route path="notes" element={<NotesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SpaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
