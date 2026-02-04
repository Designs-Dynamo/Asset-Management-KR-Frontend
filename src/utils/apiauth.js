import axios from 'axios';

// Create an axios instance with your backend base URL
const api = axios.create({
  baseURL: 'https://asset-management-and-tracking-syste.vercel.app/api', // ⚠️ Replace with your actual Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loginUser = async (credentials) => {
  try {
    // POST request to your login endpoint
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    // Return a readable error message
    throw error.response?.data?.message || 'Login failed. Please check your network.';
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const fetchBranchAssets = async () => {
  try {
    // This hits 'router.get("/", ...)' in your backend
    // The backend uses the token to determine WHICH branch's assets to return
    const response = await api.get('/assets/', getAuthHeaders());
    return response.data;
  } catch (error) {
    // Return a clean error message
    throw error.response?.data?.message || "Failed to load assets.";
  }
};

export const fetchallAssets = async () => {
  try {
    // This hits 'router.get("/", ...)' in your backend
    // The backend uses the token to determine WHICH branch's assets to return
    const response = await api.get('/assets/all', getAuthHeaders());
    return response.data;
  } catch (error) {
    // Return a clean error message
    throw error.response?.data?.message || "Failed to load assets.";
  }
};

export const fetchAssetDetails = async (id) => {
  try {
    // Matches backend: router.get("/:id", auth, getAssetDetails);
    const response = await axios.get(`https://asset-management-and-tracking-syste.vercel.app/api/assets/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch asset details";
  }
};

export const fetchRequests = async (id) => {
  try {
    // Matches backend: router.get("/:id", auth, getAssetDetails);
    const response = await axios.get(`https://asset-management-and-tracking-syste.vercel.app/api/asset-update/pending`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch asset details";
  }
};


export default api;