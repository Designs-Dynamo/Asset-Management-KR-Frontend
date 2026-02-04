import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Icon from '../components/Icon';
// --- Sub-Components ---

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Retrieve data passed from ManageAsset page
  const { assetId } = location.state || { assetId: null }; 

  // --- Dynamic Dashboard Navigation Logic ---
  const handleDashboardRedirect = () => {
    // 1. Get Role
    const role = localStorage.getItem('userRole');

    // 2. Get Branch ID from LocalStorage (Assuming 'user' object exists)
    let branchId = 'BH001'; // Default fallback
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        if (userObj.branchId) branchId = userObj.branchId;
      }
    } catch (error) {
      console.error("Error reading user data", error);
    }

    // 3. Navigate based on Role
    if (role === 'ADMIN') {
      navigate('/admindashboard');
    } else {
      navigate(`/${branchId}/dashboard`);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        
        {/* Success Card */}
        <div className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-border-dark p-8 md:p-12 text-center animate-in zoom-in-95 duration-300">
          
          {/* Animated Icon */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 animate-in fade-in zoom-in duration-500 delay-100">
              <Icon name="fact_check" className="text-6xl" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping opacity-75"></div>
          </div>

          {/* Text Content */}
          <h1 className="text-3xl font-black tracking-tight mb-3">
            Request Submitted!
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 leading-relaxed">
            The asset update request has been successfully generated. It is now pending approval in the requests queue.
          </p>

          {/* Reference ID Badge */}
          {assetId && (
            <div className="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl py-3 px-6 mb-8 inline-block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Asset Reference ID</p>
              <p className="font-mono text-primary font-bold text-lg">#{assetId.slice(-6).toUpperCase()}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleDashboardRedirect} // <--- UPDATED CLICK HANDLER
              className="px-8 py-3.5 rounded-xl border border-slate-200 dark:border-border-dark font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              <Icon name="dashboard" />
              <span>Dashboard</span>
            </button>
          </div>

        </div>

      </main>
    </div>
  );
};

export default SuccessPage;