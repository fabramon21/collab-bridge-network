
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "../pages/Index";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Messages from "../pages/Messages";
import Network from "../pages/Network";
import Profile from "../pages/Profile";
import Events from "../pages/Events";
import HousingPage from "../pages/HousingPage";
import Discussions from "../pages/Discussions";
import Internships from "../pages/Internships";
import Terms from "../pages/Terms";
import Privacy from "../pages/Privacy";
import About from "../pages/About";


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/about" element={<About />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/network"
        element={
          <ProtectedRoute>
            <Network />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        }
      />
      <Route
        path="/housing"
        element={
          <ProtectedRoute>
            <HousingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/discussions"
        element={
          <ProtectedRoute>
            <Discussions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/internships"
        element={
          <ProtectedRoute>
            <Internships />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
