import { Navigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

function ProtectedRoute({ children, requiredRole, redirectTo }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  //   const hasRequiredRole = user.publicMetadata.role === requiredRole;
  const hasRequiredRole =
    user && user.publicMetadata && user.publicMetadata.role === requiredRole;

  console.log(user.publicMetadata);

  if (!hasRequiredRole) {
    return <Navigate to={redirectTo} />;
  }

  return children;
}

export default ProtectedRoute;
