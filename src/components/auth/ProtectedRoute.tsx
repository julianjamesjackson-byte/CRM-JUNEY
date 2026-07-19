import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, isSignedIn } = useAuth();

  // Show nothing (or a spinner) while Clerk is initializing
  if (!isLoaded) {
    return <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-healthcare-teal border-t-transparent animate-spin" />
    </div>;
  }

  // If not signed in, kick them to the login page
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  // If signed in, let them through
  return <>{children}</>;
};
