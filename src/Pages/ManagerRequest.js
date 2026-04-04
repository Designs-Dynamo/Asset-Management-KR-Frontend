import React, { useState, useEffect } from "react";
import axios from "axios";
import ManagerNavbar from "../components/ManagerNavbar";
import Icon from "../components/Icon";
import { getAuthData } from "../utils/url";

// --- Helper Components ---

const Badge = ({ children, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    red: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  };
  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
};

const DiffRow = ({ label, current, proposed }) => {
  // Check if proposed is a valid value to show
  if (proposed === undefined || proposed === null || proposed === "") return null;
  const isChanged = String(current) !== String(proposed);

  return (
    <div className={`grid grid-cols-12 gap-4 p-3 border-b border-slate-100 dark:border-border-dark last:border-0 ${isChanged ? 'bg-amber-50/50 dark:bg-amber-500/5' : ''}`}>
      <div className="col-span-4 text-xs font-bold text-slate-500 uppercase tracking-wide self-center">{label}</div>
      <div className="col-span-4 text-sm text-slate-400 font-mono self-center break-words">{current || <span className="opacity-30">--</span>}</div>
      <div className="col-span-4 text-sm font-bold flex items-center gap-2 self-center break-words">
        {isChanged && <Icon name="arrow_right_alt" className="text-amber-500 text-xs" />}
        <span className={isChanged ? "text-primary" : "text-slate-700 dark:text-slate-300"}>{proposed}</span>
      </div>
    </div>
  );
};

const ManagerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  const auth = getAuthData();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:5000/api/asset-update/manager/pending", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch manager requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (actionType) => {
    if (!selectedRequest) return;
    setProcessing(true);
    
    try {
      const token = localStorage.getItem("authToken");
      let endpoint = "";
      
      // Update these strings to match your backend exactly
      if (actionType === 'APPROVE') endpoint = `http://localhost:5000/api/asset-update/${selectedRequest._id}/manager-approve`;
      else if (actionType === 'REJECT') endpoint = `http://localhost:5000/api/asset-update/${selectedRequest._id}/manager-reject`;
      else if (actionType === 'ESCALATE') endpoint = `http://localhost:5000/api/asset-update/${selectedRequest._id}/escalate-to-admin`;

      await axios.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRequests(prev => prev.filter(r => r._id !== selectedRequest._id));
      setSelectedRequest(null);
      alert(`Request ${actionType.toLowerCase()}ed successfully.`);
    } catch (err) {
      alert(`Action failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display flex flex-col">
      <ManagerNavbar />
      
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex items-end justify-between mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight">Regional Approvals</h1>
              <p className="text-slate-500">Inventory update requests from branches in your region.</p>
            </div>
            <button onClick={fetchRequests} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl text-sm font-bold hover:bg-slate-50 transition-all">
              <Icon name="refresh" className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-background-dark/30 text-slate-500 text-[11px] uppercase tracking-widest border-b border-slate-200 dark:border-border-dark">
                  <th className="px-6 py-5">Asset Info</th>
                  <th className="px-6 py-5">Branch / User</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                {loading ? (
                  <tr><td colSpan="5" className="p-20 text-center text-slate-400">Loading requests...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="5" className="p-20 text-center text-slate-500 italic">No pending requests found.</td></tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Icon name="devices" /></div>
                          <div>
                            <p className="text-sm font-bold">{req.assetId?.assetType || "Unknown"}</p>
                            <p className="text-[10px] font-mono text-slate-400">{req.assetId?.assetCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold">{req.branchId}</p>
                        {/* FIXED: Using req.requestedBy.name because it is an object */}
                        <p className="text-[11px] text-slate-400">By: {req.requestedBy?.name || "Staff"}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {req.status === 'ESCALATED_TO_ADMIN' ? <Badge color="purple">Escalated</Badge> : <Badge color="amber">Pending</Badge>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelectedRequest(req)} className="px-5 py-2 bg-slate-900 dark:bg-primary text-white text-[11px] font-black uppercase rounded-xl transition-all">Review</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* --- REVIEW MODAL --- */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedRequest(null)}></div>
          
          <div className="relative bg-white dark:bg-surface-dark w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 border border-slate-200 dark:border-border-dark">
            
            <div className="px-10 py-8 border-b border-slate-100 dark:border-border-dark flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center"><Icon name="fact_check" className="text-3xl" /></div>
                <div>
                  <h2 className="text-2xl font-black">Verify Regional Update</h2>
                  {/* FIXED: requestedBy.name */}
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Requested by: {selectedRequest.requestedBy?.name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><Icon name="close" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8">
              
              <div className="bg-slate-50 dark:bg-background-dark/40 border border-slate-200 dark:border-border-dark rounded-3xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 gap-4 p-4 bg-slate-100 dark:bg-border-dark text-[10px] font-black uppercase text-slate-500 border-b">
                  <div className="col-span-4 pl-2">Property</div>
                  <div className="col-span-4">Original Record</div>
                  <div className="col-span-4">Proposed Update</div>
                </div>
                
                {/* Meta Comparison */}
                {selectedRequest.updatedAssetMeta && (
                  <>
                    <DiffRow label="Category" current={selectedRequest.assetId?.assetType} proposed={selectedRequest.updatedAssetMeta.assetType} />
                    <DiffRow label="User Assignment" current={selectedRequest.assetId?.assignedTo} proposed={selectedRequest.updatedAssetMeta.assignedTo} />
                  </>
                )}

                {/* Device Details Comparison */}
                {selectedRequest.updatedDeviceDetails && (
                  <>
                    <DiffRow label="Device Name" current={selectedRequest.assetId?.deviceDetails?.deviceName} proposed={selectedRequest.updatedDeviceDetails.deviceName} />
                    <DiffRow label="RAM Capacity" current={selectedRequest.assetId?.deviceDetails?.ram} proposed={selectedRequest.updatedDeviceDetails.ram} />
                    <DiffRow label="SSD Size" current={selectedRequest.assetId?.deviceDetails?.ssd} proposed={selectedRequest.updatedDeviceDetails.ssd} />
                    <DiffRow label="OS Version" current={selectedRequest.assetId?.deviceDetails?.os} proposed={selectedRequest.updatedDeviceDetails.os} />
                  </>
                )}

                {/* Financial/Price Comparison */}
                {selectedRequest.updatedextraprice && (
                  <>
                    <div className="col-span-12 px-5 py-2 bg-emerald-500/10 text-emerald-600 font-bold text-[10px] uppercase mt-2">Cost Impact</div>
                    <DiffRow label="RAM Price" current="--" proposed={selectedRequest.updatedextraprice.pram ? `₹${selectedRequest.updatedextraprice.pram}` : null} />
                    <DiffRow label="SSD Price" current="--" proposed={selectedRequest.updatedextraprice.pssd ? `₹${selectedRequest.updatedextraprice.pssd}` : null} />
                    <DiffRow label="Service Cost" current="--" proposed={selectedRequest.updatedextraprice.pother ? `₹${selectedRequest.updatedextraprice.pother}` : null} />
                  </>
                )}
              </div>

              <div className="p-6 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-2xl">
                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-2">Request Reasoning</h3>
                <p className="text-sm italic text-slate-600 dark:text-slate-400">"{selectedRequest.notes || "No reason specified."}"</p>
              </div>
            </div>

            <div className="px-10 py-8 border-t border-slate-100 dark:border-border-dark bg-slate-50/80 dark:bg-surface-dark flex justify-end gap-3 backdrop-blur-md">
              <button onClick={() => setSelectedRequest(null)} className="px-6 py-3 font-bold text-slate-500" disabled={processing}>Cancel</button>
              
              <button onClick={() => handleAction('REJECT')} disabled={processing} className="px-6 py-3 rounded-2xl font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-2">
                <Icon name="block" className="text-sm" /> Reject
              </button>
              
              <button onClick={() => handleAction('ESCALATE')} disabled={processing} className="px-6 py-3 rounded-2xl font-bold text-purple-600 bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-all flex items-center gap-2">
                <Icon name="unfold_more" className="text-sm" /> Escalate
              </button>
              
              <button onClick={() => handleAction('APPROVE')} disabled={processing} className="px-10 py-3 rounded-2xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2">
                {processing ? <Icon name="sync" className="animate-spin" /> : <Icon name="verified" />}
                <span>Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerRequests;