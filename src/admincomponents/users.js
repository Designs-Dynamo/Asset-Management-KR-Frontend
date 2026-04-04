import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNav from '../admincomponents/AdminNav';
import Icon from '../components/Icon';

// --- Sub-Component: User Card ---
// const UserCard = ({ user, onDelete }) => { // 1. Accepted onDelete prop
//   const isBranchUser = user.role === "BRANCH_USER";

//   return (
//     <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
      
//       {/* Card Header with Role Banner */}
//       <div className={`h-2 w-full ${isBranchUser ? 'bg-blue-500' : 'bg-purple-600'}`}></div>
      
//       <div className="p-6">
        
//         {/* Top Row: Avatar & Role Badge */}
//         <div className="flex justify-between items-start mb-4">
//           <div className={`size-12 rounded-2xl flex items-center justify-center text-xl font-bold ${
//             isBranchUser 
//               ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' 
//               : 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
//           }`}>
//             {user.name.charAt(0).toUpperCase()}
//           </div>
//           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
//             isBranchUser 
//               ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20' 
//               : 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:border-purple-500/20'
//           }`}>
//             {user.role === 'BRANCH_USER' ? 'Branch Mgr' : 'Admin'}
//           </span>
//         </div>

//         {/* User Identity */}
//         <div className="mb-6">
//           <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">{user.name}</h3>
//           <div className="flex items-center gap-2 text-slate-500 mt-1">
//             <Icon name="mail" className="!text-sm" />
//             <p className="text-xs font-mono truncate">{user.email}</p>
//           </div>
//         </div>

//         {/* Details Grid */}
//         <div className="bg-slate-50 dark:bg-background-dark/50 rounded-xl p-4 border border-slate-100 dark:border-border-dark space-y-3">
          
//           <div className="flex justify-between items-center">
//             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
//               <Icon name="store" className="!text-sm" /> Branch
//             </span>
//             <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono">
//               {user.branchId}
//             </span>
//           </div>

//           <div className="h-px bg-slate-200 dark:border-border-dark"></div>

//           <div className="flex justify-between items-center">
//             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
//               <Icon name="fingerprint" className="!text-sm" /> User ID
//             </span>
//             <span className="text-[10px] font-mono text-slate-500 truncate max-w-[100px]" title={user._id}>
//               {user._id}
//             </span>
//           </div>

//         </div>

//         {/* Actions */}
//         <div className="mt-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          
//           {/* 2. Connected Delete Button */}
//           <button 
//             onClick={() => onDelete(user._id)} 
//             className="flex-1 py-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-2 transition-colors"
//           >
//             <Icon name="delete" className="!text-sm" /> Remove
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// --- Sub-Component: User Card ---
const UserCard = ({ user, onDelete }) => {
  // Define Role Identities
  const isAdmin = user.role === "ADMIN";
  const isRegionManager = user.role === "REGION_MANAGER";
  const isBranchUser = user.role === "BRANCH_USER";

  // Dynamic Styles based on Role
  const theme = {
    ADMIN: "bg-purple-600 text-purple-600 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400",
    REGION_MANAGER: "bg-amber-500 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400",
    BRANCH_USER: "bg-blue-500 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400",
  };

  const roleLabel = {
    ADMIN: "System Admin",
    REGION_MANAGER: "Region Mgr",
    BRANCH_USER: "Branch User",
  };

  return (
    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-md overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 group">
      
      {/* Card Header with Dynamic Role Color */}
      <div className={`h-2 w-full ${
        isAdmin ? 'bg-purple-600' : isRegionManager ? 'bg-amber-500' : 'bg-blue-500'
      }`}></div>
      
      <div className="p-6">
        
        {/* Top Row: Avatar & Role Badge */}
        <div className="flex justify-between items-start mb-4">
          <div className={`size-12 rounded-2xl flex items-center justify-center text-xl font-bold uppercase ${theme[user.role] || theme.BRANCH_USER}`}>
            {user.name.charAt(0)}
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${theme[user.role] || theme.BRANCH_USER}`}>
            {roleLabel[user.role] || "Unknown"}
          </span>
        </div>

        {/* User Identity */}
        <div className="mb-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">{user.name}</h3>
          <div className="flex items-center gap-2 text-slate-500 mt-1">
            <Icon name="mail" className="!text-sm" />
            <p className="text-xs font-mono truncate">{user.email}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="bg-slate-50 dark:bg-background-dark/50 rounded-xl p-4 border border-slate-100 dark:border-border-dark space-y-3">
          
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="location_city" className="!text-sm" /> 
              {isRegionManager ? "Region" : "Branch"}
            </span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono">
              {user.branchId || user.regionId || "N/A"}
            </span>
            
          </div>

          <div className="h-px bg-slate-200 dark:border-border-dark"></div>

          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="verified_user" className="!text-sm" /> Region
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              {user.regionId}
            </span>
          </div>

          <div className="h-px bg-slate-200 dark:border-border-dark"></div>

          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="verified_user" className="!text-sm" /> Permission
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              {isAdmin ? "Full Access" : isRegionManager ? "Regional" : "Local"}
            </span>
          </div>

        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={() => onDelete(user._id)} 
            className="flex-1 py-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-2 transition-colors border border-red-100 dark:border-red-500/20"
          >
            <Icon name="delete" className="!text-sm" /> Remove User
          </button>
        </div>

      </div>
    </div>
  );
};

// --- Main Page Component ---
const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const res = await axios.get("http://localhost:5000/api/auth/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Fetch users error:", err);
        setError("Failed to load user list.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // 3. Delete Handler Logic
  const handleDelete = async (userId) => {
    // Confirm before deleting
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`http://localhost:5000/api/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Optimistic UI Update: Remove user from state immediately
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      alert("User deleted successfully.");

    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete user: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Icon name="sync" className="animate-spin text-3xl text-primary" />
          <p className="text-sm font-bold uppercase tracking-widest">Loading Personnel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display">
      <AdminNav />

      <main className="max-w-[1440px] mx-auto px-4 md:px-10 py-8">
        
        {/* Page Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">User Management</h1>
            <p className="text-slate-500 mt-1">
              Active personnel across <span className="font-bold text-slate-900 dark:text-white">{users.length}</span> accounts.
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/create-user')}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Icon name="person_add" />
            <span>Add New User</span>
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-2">
            <Icon name="error" /> {error}
          </div>
        )}

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((user) => (
            <UserCard 
              key={user._id} 
              user={user} 
              onDelete={handleDelete} // 4. Pass the function down
            />
          ))}
          
          {/* Empty State */}
          {users.length === 0 && !error && (
            <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-border-dark rounded-2xl">
              <Icon name="group_off" className="!text-5xl mb-4 opacity-50" />
              <p className="text-lg font-bold">No users found</p>
              <p className="text-sm">Get started by adding a new user.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default UserList;