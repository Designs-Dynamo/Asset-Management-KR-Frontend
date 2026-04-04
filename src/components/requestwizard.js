import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminNav from "../admincomponents/AdminNav"; 

// --- Helper Components ---

const Icon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const Badge = ({ children, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    red: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  };
  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
};

// --- UPDATED DIFF ROW COMPONENT ---
// This now shows the row even if there is no proposed change
const DiffRow = ({ label, current, proposed }) => {
  // If both are missing, don't render the row
  if (!current && !proposed) return null;

  const hasProposed = proposed !== undefined && proposed !== null && proposed !== "";
  const isChanged = hasProposed && String(current) !== String(proposed);

  return (
    <div className={`grid grid-cols-12 gap-4 p-3 border-b border-slate-100 dark:border-border-dark last:border-0 ${isChanged ? 'bg-amber-50/50 dark:bg-amber-500/5' : ''}`}>
      <div className="col-span-4 text-xs font-bold text-slate-500 uppercase tracking-wide self-center">
        {label}
      </div>
      <div className={`col-span-4 text-sm self-center break-words ${isChanged ? 'text-slate-400 font-mono' : 'text-slate-700 dark:text-slate-300 font-bold'}`}>
        {current || <span className="opacity-30">--</span>}
      </div>
      <div className="col-span-4 text-sm font-bold flex items-center gap-2 self-center break-words">
        {isChanged ? (
          <>
            <Icon name="arrow_right_alt" className="text-amber-500 text-xs" />
            <span className="text-primary">{proposed}</span>
          </>
        ) : (
          <span className="text-slate-400 text-[10px] font-normal italic tracking-tight">No change</span>
        )}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:5000/api/asset-update/admin/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (status) => {
    if (!selectedRequest) return;
    setProcessing(true);
    
    try {
      const token = localStorage.getItem("authToken");
      const endpoint = status === 'APPROVE' 
        ? `http://localhost:5000/api/asset-update/${selectedRequest._id}/approve`
        : `http://localhost:5000/api/asset-update/${selectedRequest._id}/reject`;

      await axios.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRequests(prev => prev.filter(r => r._id !== selectedRequest._id));
      setSelectedRequest(null);
      alert(`Request ${status === 'APPROVE' ? 'Approved' : 'Rejected'} successfully.`);

    } catch (err) {
      console.error(err);
      alert(`Failed to ${status.toLowerCase()} request: ${err.response?.data?.message || err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display flex">
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminNav />
        
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            
            <div className="flex items-end justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black tracking-tight">Pending Requests</h1>
                <p className="text-slate-500">Review and manage asset update submissions from branch users.</p>
              </div>
              <button onClick={fetchRequests} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
                <Icon name="refresh" className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>

            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-background-dark/30 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-border-dark">
                    <th className="px-6 py-4 font-bold">Asset</th>
                    <th className="px-6 py-4 font-bold">Branch / User</th>
                    <th className="px-6 py-4 font-bold">Request Date</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                  {loading ? (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading requests...</td></tr>
                  ) : requests.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="p-12 text-center text-slate-500">
                            <div className="flex flex-col items-center">
                                <Icon name="task_alt" className="text-4xl text-green-500 mb-2" />
                                <p>All caught up! No pending requests.</p>
                            </div>
                        </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center"><Icon name="inventory_2" className="text-lg" /></div>
                            <div>
                              <p className="text-sm font-bold">{req.assetId?.assetName || req.assetId?.assetType || "Unknown"}</p>
                              <p className="text-xs font-mono text-slate-500">{req.assetId?.assetCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium">{req.branchId}</p>
                          {/* FIX: Use .name and .branchId from populated requestedBy object */}
                          <p className="text-xs text-slate-500">By: {req.requestedBy?.name || "Unknown"}</p>
                          <p className="text-xs text-slate-500">User Branch: {req.requestedBy?.branchId || "N/A"}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4"><Badge color="amber">{req.status}</Badge></td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setSelectedRequest(req)} className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">Review</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </main>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedRequest(null)}></div>
          
          <div className="relative bg-white dark:bg-surface-dark w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-8 py-6 border-b border-slate-100 dark:border-border-dark flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center"><Icon name="fact_check" className="text-3xl" /></div>
                <div>
                  <h2 className="text-xl font-black">Review Request</h2>
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">ID: {selectedRequest._id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><Icon name="close" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              
              <div className="mb-8 p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-4">
                <Icon name="info" className="text-primary text-2xl" />
                <div>
                  <p className="text-sm font-bold text-primary">Updating Asset: {selectedRequest.assetId?.assetName || selectedRequest.assetId?.assetType}</p>
                  <p className="text-xs text-slate-500">Asset Code: {selectedRequest.assetId?.assetCode} • Current Branch: {selectedRequest.branchId}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="md:col-span-2 bg-slate-50 dark:bg-background-dark/50 border border-slate-200 dark:border-border-dark rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-4 p-3 bg-slate-100 dark:bg-border-dark border-b border-slate-200 dark:border-border-dark text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <div className="col-span-4">Field</div>
                    <div className="col-span-4">Current Value</div>
                    <div className="col-span-4">Proposed Value</div>
                  </div>
                  
                  {/* Meta Updates - Always showing rows now */}
                  <DiffRow label="Asset Type" current={selectedRequest.assetId?.assetType} proposed={selectedRequest.updatedAssetMeta?.assetType} />
                  <DiffRow label="Company" current={selectedRequest.assetId?.assetCompany} proposed={selectedRequest.updatedAssetMeta?.assetCompany} />
                  <DiffRow label="Purchase Date" current={selectedRequest.assetId?.purchaseDate?.split('T')[0]} proposed={selectedRequest.updatedAssetMeta?.purchaseDate?.split('T')[0]} />
                  <DiffRow label="Assigned Employee" current={selectedRequest.assetId?.assignedTo} proposed={selectedRequest.updatedAssetMeta?.assignedTo} />
                  <DiffRow label="Department" current={selectedRequest.assetId?.department} proposed={selectedRequest.updatedAssetMeta?.department} />

                  {/* Technical Specifications Section */}
                  <div className="col-span-12 px-3 py-2 bg-slate-200/50 dark:bg-white/5 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                    Technical Specifications
                  </div>
                  <DiffRow label="Device Name" current={selectedRequest.assetId?.deviceDetails?.deviceName} proposed={selectedRequest.updatedDeviceDetails?.deviceName} />
                  <DiffRow label="CPU" current={selectedRequest.assetId?.deviceDetails?.cpu} proposed={selectedRequest.updatedDeviceDetails?.cpu} />
                  <DiffRow label="RAM" current={selectedRequest.assetId?.deviceDetails?.ram} proposed={selectedRequest.updatedDeviceDetails?.ram} />
                  <DiffRow label="SSD" current={selectedRequest.assetId?.deviceDetails?.ssd} proposed={selectedRequest.updatedDeviceDetails?.ssd} />
                  <DiffRow label="HDD" current={selectedRequest.assetId?.deviceDetails?.hdd} proposed={selectedRequest.updatedDeviceDetails?.hdd} />
                  <DiffRow label="OS" current={selectedRequest.assetId?.deviceDetails?.os} proposed={selectedRequest.updatedDeviceDetails?.os} />

                  {/* Financial Section */}
                  {selectedRequest.updatedextraprice && (
                    <>
                      <div className="col-span-12 px-3 py-2 bg-emerald-500/10 text-emerald-600 font-bold text-[10px] uppercase tracking-widest mt-2">
                        Financial Impact / Cost Updates
                      </div>
                      <DiffRow label="RAM Cost" current="--" proposed={selectedRequest.updatedextraprice.pram ? `$${selectedRequest.updatedextraprice.pram}` : null} />
                      <DiffRow label="SSD Cost" current="--" proposed={selectedRequest.updatedextraprice.pssd ? `$${selectedRequest.updatedextraprice.pssd}` : null} />
                      <DiffRow label="HDD Cost" current="--" proposed={selectedRequest.updatedextraprice.phdd ? `$${selectedRequest.updatedextraprice.phdd}` : null} />
                      <DiffRow label="Service/Repair" current="--" proposed={selectedRequest.updatedextraprice.pother ? `$${selectedRequest.updatedextraprice.pother}` : null} />
                    </>
                  )}
                </div>

                {selectedRequest.requestedBranchId && (
                  <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase text-blue-500 mb-1">Branch Transfer Requested</p>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <span>{selectedRequest.branchId}</span>
                        <Icon name="arrow_right_alt" />
                        <span>{selectedRequest.requestedBranchId}</span>
                      </div>
                    </div>
                    <Icon name="local_shipping" className="text-blue-300 text-3xl" />
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-black uppercase text-slate-400 mb-3">User Notes</h3>
                  <div className="p-4 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl text-sm italic text-slate-600">
                    "{selectedRequest.notes || "No additional notes provided."}"
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black uppercase text-slate-400 mb-3">New Images</h3>
                  <div className="flex gap-2">
                    {selectedRequest.updatedImages && selectedRequest.updatedImages.length > 0 ? (
                      selectedRequest.updatedImages.map((img, i) => (
                        <div key={i} className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden relative group cursor-pointer">
                          <img src={img.url} alt="New" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Icon name="visibility" className="text-xs" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic">No images uploaded.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 dark:border-border-dark bg-slate-50/80 dark:bg-surface-dark flex justify-end gap-4 backdrop-blur-md">
              <button onClick={() => setSelectedRequest(null)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors" disabled={processing}>Cancel</button>
              <button onClick={() => handleAction('REJECT')} disabled={processing} className="px-6 py-3 rounded-xl font-bold text-rose-600 border-2 border-rose-100 bg-rose-50 hover:bg-rose-100 hover:border-rose-200 transition-all disabled:opacity-50 flex items-center gap-2"><Icon name="close" /><span>Reject</span></button>
              <button onClick={() => handleAction('APPROVE')} disabled={processing} className="px-8 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-none transition-all disabled:opacity-50 transform active:scale-95 flex items-center gap-2">{processing ? <Icon name="sync" className="animate-spin" /> : <Icon name="check" />}<span>Approve Update</span></button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminRequests;