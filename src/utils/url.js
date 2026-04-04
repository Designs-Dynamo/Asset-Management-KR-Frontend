import { jwtDecode } from "jwt-decode";

export const getAuthData = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return {
      token,
      user: decoded,
      role: decoded.role?.toUpperCase(),
      regionId: decoded.regionId,
      branchId: decoded.branchId,
      userId: decoded.id
    };
  } catch (error) {
    console.error("Token decoding failed", error);
    return null;
  }
};

// Helper to check if user is a specific role
export const isRole = (role) => {
  const data = getAuthData();
  return data?.role === role.toUpperCase();
};