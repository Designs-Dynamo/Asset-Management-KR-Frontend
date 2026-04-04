import React, { useState, useEffect } from 'react';
import Icon from "./Icon";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
// Import your branch helper if available, otherwise use fallback
import { getBranchName } from "./Branches"; 

const Navbar = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  // State for Profile Wizard
  const [showProfile, setShowProfile] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: null,
    email: "user@system.com",
    role: "GUEST",
    branchId: null,
    regionId: null
  });

  // 1. Logic to get Branch ID & User Info from Token
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log(decoded);
        setUserInfo({
          name: decoded.name,
          branchId: decoded.branchId || params.branchId,
          regionId: decoded.regionId
        });
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, [params.branchId]);

  // Use the branchId from params if available (current view), else from token (home branch)
  const currentBranchId = params.branchId || userInfo.branchId;

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  // 2. Define Items inside component to use the dynamic branchId
  const NAV_ITEMS = [
    { 
      icon: 'dashboard', 
      label: 'Overview', 
      link: currentBranchId ? `/${currentBranchId}/dashboard` : '/' 
    },
    { 
      icon: 'inventory_2', 
      label: 'Assets', 
      link: `/${currentBranchId}/assets`
    },
    { 
      icon: 'pending_actions', 
      label: 'Requests', 
      link: currentBranchId ? `/${currentBranchId}/branchrequests` : '/' 
    },
    { 
      icon: 'help_outline', 
      label: 'Support', 
      link: '/support' 
    },
  ];

  return (
    <header className="h-14 border-b border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark px-6 flex items-center justify-between shrink-0 relative z-50">
      
      {/* --- LEFT: LOGO & NAV --- */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="size-7 bg-primary rounded flex items-center justify-center text-white">
            <Icon name="account_tree" className="!text-lg" />
          </div>
          <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
            AssetTrack <span className="text-primary">Pro</span>
          </h2>
        </div>
        
        <nav className="flex items-center gap-2 border-l border-border-dark ml-2 pl-6">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.link;
            return (
              <Link
                key={item.label}
                to={item.link}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* --- RIGHT: SEARCH, NOTIFICATIONS & PROFILE --- */}
      <div className="flex items-center gap-4">
        
        {/* Search Bar */}
        {/* <div className="relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 !text-base" />
          <input
            className="w-80 h-8 pl-9 pr-4 py-1 text-xs rounded border border-slate-200 dark:border-border-dark bg-slate-100 dark:bg-background-dark focus:ring-1 focus:ring-primary/50 outline-none text-slate-600 dark:text-slate-300"
            placeholder="Jump to serial, IP, or user..."
          />
        </div> */}

        {/* Notifications */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-border-dark">
          <div className="relative cursor-pointer group">
             <Icon name="notifications" className="text-slate-500 !text-xl group-hover:text-primary transition-colors" />
             <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full border border-white dark:border-surface-dark"></span>
          </div>
          
          {/* PROFILE WIZARD CONTAINER */}
          <div 
            className="relative"
            onMouseEnter={() => setShowProfile(true)} 
            onMouseLeave={() => setShowProfile(false)}
          >
            {/* Avatar Image */}
            <div className={`size-8 rounded border transition-all cursor-pointer flex items-center justify-center overflow-hidden ${showProfile ? 'border-primary ring-2 ring-primary/20' : 'border-slate-300 dark:border-border-dark'}`}>
              <img
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/a/ACg8ocL-w_FJj8YJ_w_FJj8YJ=s96-c" // Use a safe placeholder or real user image
                alt="Profile"
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${userInfo.name}&background=0D8ABC&color=fff` }} // Fallback to initials
              />
            </div>

            {/* --- HOVER PROFILE CARD --- */}
            <div 
              className={`absolute top-10 right-0 w-72 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-2xl transition-all duration-200 origin-top-right overflow-hidden ${
                showProfile ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
              }`}
            >
              {/* Header: User Info */}

              {/* Body: Branch Context */}
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Current Branch Context</p>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark group cursor-default">
                    <div className="size-8 rounded bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Icon name="domain" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {getBranchName(userInfo.branchId) || "Unknown Branch"}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">ID: {userInfo.branchId || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark group cursor-default">
                    <div className="size-8 rounded bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Icon name="domain" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {userInfo.regionId || "Unknown Branch"}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">ID: {userInfo.branchId || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:border-border-dark w-full"></div>

                {/* Actions */}
                <div className="space-y-1">
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                  >
                    <Icon name="logout" className="!text-base" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
            {/* --- END HOVER CARD --- */}

          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;