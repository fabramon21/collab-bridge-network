
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mt-4 text-lg text-gray-600">Loading your account...</span>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but remember where they were trying to go
    console.log('No user found, redirecting to login from:', location.pathname);
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  console.log('User authenticated, rendering protected content');
  return <>{children}</>;
}
