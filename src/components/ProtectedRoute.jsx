// src/components/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.user);
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    // Redirect to login and remember where the user came from
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
