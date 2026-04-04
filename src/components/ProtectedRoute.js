import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const token = localStorage.getItem('authToken');
//   const { branchId } = useParams(); // Gets the ID from the URL (e.g., /NY-01/dashboard)

//   // 1. Check if User is Logged In
//   if (!token) {
//     return <Navigate to="/" replace />;
//   }

//   try {
//     const decoded = jwtDecode(token);
//     const userRole = decoded.role;      // e.g., "BRANCH_USER" or "ADMIN"
//     const userBranchId = decoded.branchId; // e.g., "NY-01" from the database

//     // 2. Check Role Permission (e.g., Block Branch User from Admin pages)
//     if (allowedRoles && !allowedRoles.includes(userRole)) {
//       return <Navigate to="/" replace />; // Or an "Unauthorized" page
//     }

//     // 3. CROSS-BRANCH PROTECTION (The Logic You Asked For)
//     // If the URL contains a branchId, AND the user is NOT an Admin...
//     if (userRole !== 'ADMIN') {
//       // ...Check if the URL ID matches their Token ID
//       if (branchId !== userBranchId) {
//         // If they don't match, force them back to THEIR OWN dashboard
//         return <Navigate to={`/${userBranchId}/dashboard`} replace />;
//       }
//     }

//     // 4. Access Granted
//     return children;

//   } catch (error) {
//     // If token is malformed or expired
//     localStorage.removeItem('authToken');
//     return <Navigate to="/" replace />;
//   }
// };



const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('authToken');
  const { branchId, regionId } = useParams(); // Get either ID from the URL

  if (!token) return <Navigate to="/" replace />;

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role;      
    const userBranchId = decoded.branchId; 
    const userRegionId = decoded.regionId; // Extract regionId from token

    // 1. Role Permission Check
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }

    // 2. REGION MANAGER PROTECTION
    if (userRole === 'REGION_MANAGER') {
      // If the URL has a regionId, ensure it matches the Manager's token
      if (regionId && regionId !== userRegionId) {
        return <Navigate to={`/${userRegionId}/manager/dashboard`} replace />;
      }
      return children; // Manager is allowed to see branch pages within their region logic
    }

    // 3. BRANCH USER PROTECTION
    if (userRole === 'BRANCH_USER') {
      if (branchId && branchId !== userBranchId) {
        return <Navigate to={`/${userBranchId}/dashboard`} replace />;
      }
    }

    return children;
  } catch (error) {
    localStorage.removeItem('authToken');
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;