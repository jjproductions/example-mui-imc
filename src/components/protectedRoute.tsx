import { Navigate } from "react-router-dom";
import { AuthContext } from "../hooks/useAuth";
import { useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { userInfo, Logout } = useContext(AuthContext);
  let curToken = localStorage.getItem('token');

  console.log(`Protected Route - user:${userInfo?.user} :: token:${curToken}`);
  
  useEffect(() => {
    if (curToken) {
      // Check if the token is expired (e.g., using JWTs)
      const decodedToken = jwtDecode(curToken);
      const currentTime = Date.now() / 1000;
      const tExpiration: number = decodedToken.exp ? decodedToken.exp as number : 0;
      console.log(`current time: ${currentTime} :: expiration: ${tExpiration}`);
      if (tExpiration < currentTime) {
        //setIsAuthenticated(false);
        //Refresh Token
        console.log(`token expired: ${decodedToken.exp}`);
        //localStorage.removeItem('token');
        curToken = "";
      }
    } else {
      console.log(`PR: token is null`)
      //setIsAuthenticated(false);
    }
  }, []);
  
  if (!userInfo?.user || !curToken) {
    // user is not authenticated
    console.log("Protected Route: not authenticated")
    Logout();
    return <Navigate to="../login" />;
  }
  return (<>{children}</>)
};