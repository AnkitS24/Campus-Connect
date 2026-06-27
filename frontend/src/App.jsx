import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import useAuthStore from './store/authStore';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Placements from './pages/Placements';
import AIMentor from './pages/AIMentor';
import ResumeReview from './pages/ResumeReview';
import MockInterviews from './pages/MockInterviews';
import Profile from './pages/Profile';
import Experiences from './pages/Experiences';
import Contests from './pages/Contests';
import LeaderboardPage from './pages/LeaderboardPage';
import Admin from './pages/Admin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  }, 
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />}  /> 
          </Route>

          <Route element={<DashboardLayout />} >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/placements" element={<Placements />} />
            <Route path="/ai-mentor" element={<AIMentor />} />
            <Route path="/resume-review" element={<ResumeReview />} />
            <Route path="/mock-interviews" element={<MockInterviews />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/contests" element={<Contests />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/admin" element={<Admin />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
