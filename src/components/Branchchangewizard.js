import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AVAILABLE_BRANCHES } from './Branches';

// --- Icons Helper ---
const Icon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// --- Mock Branches (In real app, fetch this from API) ---


const BranchChangeWizard = ({ isOpen, onClose, asset }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(false);
  
  if (!isOpen || !asset) return null;

  // Filter out the current branch so user can't move to same location
  const targetBranches = AVAILABLE_BRANCHES.filter(b => b.id !== asset.branchId);

  // --- API Submit Logic ---
  const handleSubmit = async () => {
    if (!selectedBranch) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      
      // Assuming you added the route: router.post("/branch-change/:assetId", ...)
      await axios.post(
        `http://localhost:5000/api/asset-update/${asset._id}/branch-change`,
        { requestedBranchId: selectedBranch.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Navigate to success page using your unified structure
      navigate('/success', { 
        state: { assetId: asset.assetCode } 
      });
      
    } catch (error) {
      console.error("Transfer failed", error);
      alert(error.response?.data?.message || "Failed to submit transfer request");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Wizard Container */}
      <div className="relative bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-border-dark overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Transfer Asset</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            <Icon name="close" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 min-h-[300px]">
          
          {/* --- STEP 1: SELECT BRANCH --- */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Icon name="store" className="text-primary" /> Select Destination Branch
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {targetBranches.map((branch) => (
                  <div 
                    key={branch.id}
                    onClick={() => setSelectedBranch(branch)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                      selectedBranch?.id === branch.id 
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                      : "border-slate-100 dark:border-border-dark hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      selectedBranch?.id === branch.id ? "bg-primary text-white" : "bg-slate-100 dark:bg-white/10 text-slate-400"
                    }`}>
                      <Icon name="location_on" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{branch.name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono bg-slate-200 dark:bg-white/10 px-1 rounded">{branch.id}</span>
                        <span>{branch.city}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- STEP 2: CONFIRMATION --- */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Icon name="fact_check" className="text-primary" /> Confirm Transfer
              </h3>

              {/* Visual Flow */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-border-dark mb-6">
                
                {/* Current */}
                <div className="text-center w-1/3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Current Location</p>
                  <div className="font-mono text-xl font-black text-slate-700 dark:text-slate-200">{asset.branchId}</div>
                  <p className="text-xs text-slate-500 mt-1">Origin</p>
                </div>

                {/* Arrow Animation */}
                <div className="flex flex-col items-center text-primary">
                  <div className="w-full h-0.5 bg-primary/30 relative top-3"></div>
                  <Icon name="local_shipping" className="text-3xl relative z-10 bg-white dark:bg-surface-dark px-2" />
                  <Icon name="arrow_forward" className="text-xs mt-1 animate-pulse" />
                </div>

                {/* Destination */}
                <div className="text-center w-1/3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Destination</p>
                  <div className="font-mono text-xl font-black text-primary">{selectedBranch?.id}</div>
                  <p className="text-xs text-slate-500 mt-1">{selectedBranch?.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl">
                <Icon name="warning" className="text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-500">Approval Required</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-1">
                    This action will create a request. The asset will remain in <strong>{asset.branchId}</strong> until an Admin approves the transfer.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 border-t border-slate-100 dark:border-border-dark bg-slate-50/80 dark:bg-surface-dark backdrop-blur-md flex justify-end gap-3">
          {step === 1 ? (
            <>
              <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button 
                disabled={!selectedBranch}
                onClick={() => setStep(2)}
                className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                Next Step <Icon name="arrow_forward" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
              >
                {loading ? <Icon name="sync" className="animate-spin" /> : <Icon name="send" />}
                Confirm Transfer
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default BranchChangeWizard;