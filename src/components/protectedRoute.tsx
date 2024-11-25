import { Navigate } from "react-router-dom";
import { AuthContext } from "../hooks/useAuth";
import { useContext } from "react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { userInfo, token } = useContext(AuthContext);
  console.log(`Protected Route - user:${userInfo?.user} :: token:${token}`);
  
  if (!userInfo?.user && !token) {
    // user is not authenticated
    return <Navigate to="../login" />;
  }
  return (<>{children}</>)
};