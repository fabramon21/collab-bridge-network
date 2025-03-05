
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import { useState } from "react";

// Placeholder components for future development
const Messages = () => <div className="p-8 text-center">Messages feature coming soon</div>;
const Network = () => <div className="p-8 text-center">Network feature coming soon</div>;
const Profile = () => <div className="p-8 text-center">Profile feature coming soon</div>;

const queryClient = new QueryClient();

const App = () => {
  // This would normally use authentication state from context
  const [isAuthenticated] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route
              path="/messages"
              element={isAuthenticated ? <Messages /> : <Navigate to="/login" />}
            />
            <Route
              path="/network"
              element={isAuthenticated ? <Network /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
