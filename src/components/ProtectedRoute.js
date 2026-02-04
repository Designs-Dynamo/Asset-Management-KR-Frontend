import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('authToken');
  const { branchId } = useParams(); // Gets the ID from the URL (e.g., /NY-01/dashboard)

  // 1. Check if User is Logged In
  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role;      // e.g., "BRANCH_USER" or "ADMIN"
    const userBranchId = decoded.branchId; // e.g., "NY-01" from the database

    // 2. Check Role Permission (e.g., Block Branch User from Admin pages)
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />; // Or an "Unauthorized" page
    }

    // 3. CROSS-BRANCH PROTECTION (The Logic You Asked For)
    // If the URL contains a branchId, AND the user is NOT an Admin...
    if (userRole !== 'ADMIN') {
      // ...Check if the URL ID matches their Token ID
      if (branchId !== userBranchId) {
        // If they don't match, force them back to THEIR OWN dashboard
        return <Navigate to={`/${userBranchId}/dashboard`} replace />;
      }
    }

    // 4. Access Granted
    return children;

  } catch (error) {
    // If token is malformed or expired
    localStorage.removeItem('authToken');
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;