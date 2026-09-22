import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SpaceProvider } from './context/SpaceContext.jsx';

import { AuthLayout } from './layouts/AuthLayout.jsx';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';

// Code-split pages for high performance and fast initial load
const LandingPage = lazy(() => import('./pages/LandingPage.jsx').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx').then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx').then(m => ({ default: m.DashboardPage })));
const SpacesPage = lazy(() => import('./pages/SpacesPage.jsx').then(m => ({ default: m.SpacesPage })));
const SpaceDetailPage = lazy(() => import('./pages/SpaceDetailPage.jsx').then(m => ({ default: m.SpaceDetailPage })));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage.jsx').then(m => ({ default: m.DocumentsPage })));
const DocumentReaderPage = lazy(() => import('./pages/DocumentReaderPage.jsx').then(m => ({ default: m.DocumentReaderPage })));
const ChatPage = lazy(() => import('./pages/ChatPage.jsx').then(m => ({ default: m.ChatPage })));
const StudyPage = lazy(() => import('./pages/StudyPage.jsx').then(m => ({ default: m.StudyPage })));
const ComparePage = lazy(() => import('./pages/ComparePage.jsx').then(m => ({ default: m.ComparePage })));
const NotesPage = lazy(() => import('./pages/NotesPage.jsx').then(m => ({ default: m.NotesPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.jsx').then(m => ({ default: m.AnalyticsPage })));
const TeamPage = lazy(() => import('./pages/TeamPage.jsx').then(m => ({ default: m.TeamPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx').then(m => ({ default: m.SettingsPage })));

function PageLoadingFallback() {
  return (
    <div className="h-full min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
      <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      <span className="text-xs text-slate-400 font-medium tracking-wide">Loading workspace...</span>
    </div>
  );
}

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
            <Suspense fallback={<PageLoadingFallback />}>
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
                  <Route path="documents/:id" element={<DocumentReaderPage />} />
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
            </Suspense>
          </BrowserRouter>
        </SpaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
