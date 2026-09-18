import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

import Layout from './components/Layout';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import SearchResultsPage from './pages/SearchResultsPage';
import WatchPage from './pages/WatchPage';
import ChannelPage from './pages/ChannelPage';
import UploadPage from './pages/UploadPage';
import SettingsPage from './pages/SettingsPage';
import HistoryPage from './pages/HistoryPage';
import WatchLaterPage from './pages/WatchLaterPage';
import LikedVideosPage from './pages/LikedVideosPage';
import SubscriptionsFeedPage from './pages/SubscriptionsFeedPage';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import HelpPage from './pages/HelpPage';
import ErrorPage from './pages/ErrorPage';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

import StudioLayout from './pages/studio/StudioLayout';
import StudioDashboard from './pages/studio/StudioDashboard';
import StudioVideos from './pages/studio/StudioVideos';
import StudioVideoEdit from './pages/studio/StudioVideoEdit';

import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<BrowsePage section="recommended" title="Explore" />} />
                <Route path="/trending" element={<BrowsePage section="trending" title="Trending" />} />
                <Route path="/shorts" element={<BrowsePage section="latest" title="Shorts" />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/watch/:slug" element={<WatchPage />} />
                <Route path="/channel/:slug" element={<ChannelPage />} />
                <Route path="/help" element={<HelpPage />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/watch-later" element={<WatchLaterPage />} />
                  <Route path="/liked" element={<LikedVideosPage />} />
                  <Route path="/subscriptions" element={<SubscriptionsFeedPage />} />
                  <Route path="/playlists" element={<PlaylistsPage />} />
                  <Route path="/playlist/:id" element={<PlaylistDetailPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />

                  <Route path="/studio" element={<StudioLayout />}>
                    <Route index element={<StudioDashboard />} />
                    <Route path="videos" element={<StudioVideos />} />
                    <Route path="videos/:slug/edit" element={<StudioVideoEdit />} />
                  </Route>
                </Route>

                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                <Route path="/403" element={<ErrorPage code={403} />} />
                <Route path="/500" element={<ErrorPage code={500} />} />
                <Route path="*" element={<ErrorPage code={404} />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
