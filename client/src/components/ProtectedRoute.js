import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.users.user);

  // If user is not authenticated, redirect to home page
  if (!user || !user.accessToken) {
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the child component
  return children;
};

export default ProtectedRoute;
