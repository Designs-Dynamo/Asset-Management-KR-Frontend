import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Icon from "../components/Icon";

// --- Helper: Status Badge ---
const RequestStatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    REJECTED: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  };

  const icons = {
    PENDING: "hourglass_empty",
    APPROVED: "check_circle",
    REJECTED: "cancel",
  };

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.PENDING}`}>
      <Icon name={icons[status]} className="text-sm" />
      {status}
    </span>
  );
};

// --- Helper: Request Type Icon ---
const BranchRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, RESOLVED

  // --- Fetch Requests ---
  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        // Ensure you have this route in your backend: router.get("/my-requests", auth, getBranchRequests);
        const res = await axios.get("https://asset-management-and-tracking-syste.vercel.app/api/asset-update/my-requests", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Failed to load requests", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyRequests();
  }, []);

  // --- Filtering Logic ---
  const filteredRequests = requests.filter(req => {
    if (filter === "ALL") return true;
    if (filter === "PENDING") return req.status === "PENDING";
    if (filter === "RESOLVED") return req.status === "APPROVED" || req.status === "REJECTED";
    return true;
  });

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">My Requests</h1>
            <p className="text-slate-500 mt-1">Track the status of your asset updates and transfer requests.</p>
          </div>
          
          {/* Filters */}
          <div className="flex bg-white dark:bg-surface-dark p-1 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
            {["ALL", "PENDING", "RESOLVED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  filter === f 
                  ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center py-20 text-slate-400">
                <Icon name="sync" className="animate-spin text-3xl mb-2" />
                <p className="text-sm font-bold">Loading your history...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-slate-400 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl border-dashed">
                <Icon name="history_edu" className="text-4xl mb-2 opacity-50" />
                <p className="text-sm font-bold">No requests found</p>
                <p className="text-xs">Any updates you submit will appear here.</p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div 
                key={req._id} 
                className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center"
              >
                {/* Icon Box */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    req.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 
                    req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                    <Icon name={req.status === 'APPROVED' ? 'task_alt' : req.status === 'REJECTED' ? 'highlight_off' : 'pending'} className="text-2xl" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-900 dark:text-white truncate">
                            {req.updatedAssetMeta?.assetType || "Unknown Asset"}
                        </h3>
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                            {req.assetId?.assetCode}
                        </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <Icon name="calendar_today" className="text-[14px]" /> 
                            {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                        
                        {/* Identify Type */}
                        {req.requestedBranchId ? (
                            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                                <Icon name="local_shipping" className="text-[14px]" /> 
                                Transfer to {req.requestedBranchId}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5">
                                <Icon name="edit_note" className="text-[14px]" /> 
                                Detail Update
                            </span>
                        )}
                    </div>

                    {/* Admin Feedback / Notes */}
                    {(req.notes || req.status === 'REJECTED') && (
                        <div className="mt-3 text-xs bg-slate-50 dark:bg-background-dark/50 p-2 rounded-lg border border-slate-100 dark:border-border-dark inline-block">
                            <span className="font-bold text-slate-700 dark:text-slate-300">Note: </span>
                            <span className="italic text-slate-500">{req.notes || "No additional notes provided by admin."}</span>
                        </div>
                    )}
                </div>

                {/* Status Badge (Right Side) */}
                <div className="md:text-right shrink-0">
                    <RequestStatusBadge status={req.status} />
                    {req.resolvedAt && (
                        <p className="text-[10px] text-slate-400 mt-2">
                            Resolved: {new Date(req.resolvedAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
};

export default BranchRequests;