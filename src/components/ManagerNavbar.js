import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Icon from "./Icon";

const ManagerNavbar = () => {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [managerInfo, setManagerInfo] = useState({
    name: "Region Manager",
    email: "",
    regionId: ""
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setManagerInfo({
          name: decoded.name || "Manager",
          email: decoded.email || "",
          regionId: decoded.regionId || params.regionId
        });
      } catch (e) {
        console.error("Token decoding failed");
      }
    }
  }, [params.regionId]);

  const currentRegionId = params.regionId || managerInfo.regionId;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const NAV_ITEMS = [
    { 
      icon: 'grid_view', 
      label: 'Dashboard', 
      link: `/${currentRegionId}/manager/dashboard` 
    },
    { 
      icon: 'approval_delegation', 
      label: 'Pending Requests', 
      link: `/${currentRegionId}/manager/requests` 
    },

  ];

  return (
    <header className="h-16 border-b border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark px-8 flex items-center justify-between shrink-0 relative z-50 shadow-sm">
      
      {/* --- LEFT: LOGO & MANAGER NAV --- */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="size-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Icon name="account_tree" className="!text-xl" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
            AssetTrack <span className="text-primary">Pro</span>
          </h2>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Regional Hub</span>
          </div>
        </div>
        
        <nav className="flex items-center gap-1 ml-4">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.link;
            return (
              <Link
                key={item.label}
                to={item.link}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/30' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="material-symbols-outlined !text-xl">{item.icon}</span>
                <span className="text-xs font-bold tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* --- RIGHT: REGION INFO & PROFILE --- */}
      <div className="flex items-center gap-6">
        
        {/* Region Indicator */}
        <div className="hidden md:flex flex-col items-end border-r border-slate-200 dark:border-border-dark pr-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Assigned Region</p>
          <p className="text-xs font-black text-slate-700 dark:text-slate-200">{currentRegionId || "Global"}</p>
        </div>

        {/* Profile Dropdown */}
        <div 
          className="relative"
          onMouseEnter={() => setShowProfile(true)} 
          onMouseLeave={() => setShowProfile(false)}
        >
          <div className={`size-10 rounded-full border-2 transition-all cursor-pointer p-0.5 ${showProfile ? 'border-primary scale-110' : 'border-slate-200 dark:border-border-dark'}`}>
            <img
              className="w-full h-full rounded-full object-cover"
              src={`https://ui-avatars.com/api/?name=${managerInfo.name}&background=0D8ABC&color=fff`}
              alt="Manager"
            />
          </div>

          {/* HOVER CARD */}
          <div className={`absolute top-12 right-0 w-64 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl shadow-2xl transition-all duration-300 origin-top-right ${
            showProfile ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'
          }`}>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
                  {managerInfo.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate">{managerInfo.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{managerInfo.email}</p>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-border-dark">
                <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                  <Icon name="person" className="!text-lg" /> Profile Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                >
                  <Icon name="logout" className="!text-lg" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ManagerNavbar;