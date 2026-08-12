import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import ResumeAI from './pages/ResumeAI';
import CoverLetter from './pages/CoverLetter';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  return user ? children : <Navigate to="/" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" /> : children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
      <Route path="/resume-ai" element={<PrivateRoute><ResumeAI /></PrivateRoute>} />
      <Route path="/cover-letter" element={<PrivateRoute><CoverLetter /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}