import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios"; // 1. Added Axios import
import { fetchallAssets } from "../utils/apiauth"; 
import StatusBadge from "../components/StatusBadge"; 
import AdminNav from "./AdminNav";
import { getBranchName } from "../components/Branches";
import * as XLSX from 'xlsx'; 

const Adminassets = () => {

  const navigate = useNavigate();
  
  // --- Data State ---
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Filter State ---
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // --- Fetch Data on Mount ---
  useEffect(() => {

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchallAssets();
        setAssets(data || []); 
        setError(null);
      } catch (err) {
        console.error("Error fetching assets:", err);
        setError("Unauthorized access or failed to load assets.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Reset page when filters change ---
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedStatus]);

  // --- Data Source Logic ---
  const dataSource = assets && assets.length > 0 ? assets : [];

  // --- Filter Logic ---
  const filteredAssets = dataSource.filter((asset) => {
    const assetCat = asset.assetType || asset.category;
    const categoryMatch = selectedCategory === "All" || assetCat === selectedCategory;
    const assetStat = asset.deviceDetails?.currentStatus || asset.status;
    const statusMatch = selectedStatus === "All" || assetStat === selectedStatus;
    return categoryMatch && statusMatch;
  });

  // --- 2. DELETE FUNCTION ADDED HERE ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;

    try {
      const token = localStorage.getItem("authToken");
      // Calling your specific delete route
      await axios.post(`https://asset-management-and-tracking-syste.vercel.app/api/assets/delete/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update state to remove deleted item immediately
      setAssets((prev) => prev.filter((asset) => asset._id !== id));
      alert("Asset deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete asset");
    }
  };

  // --- EXPORT LOGIC ---
  const handleExport = () => {
    if (filteredAssets.length === 0) {
      alert("No assets to export.");
      return;
    }

    // Format data for Excel
    const exportData = filteredAssets.map(asset => ({
      "Asset Code": asset.assetCode,
      "Asset Name": asset.assetType || asset.deviceName || "N/A",
      "Type": asset.assetType || asset.category || "N/A",
      "Branch": getBranchName(asset.branchId) || asset.branchId,
      "Assigned To": asset.assignedTo || "Unassigned",
      "Status": asset.deviceDetails?.currentStatus || asset.status || "N/A",
      "Company": asset.assetCompany || "N/A",
      "Purchase Date": asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "N/A",
      "Serial Number": asset.serialNumber || "N/A"
    }));

    // Create Sheet & Workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assets");

    // Auto-adjust column width (optional polish)
    const wscols = [
      {wch: 15}, {wch: 20}, {wch: 15}, {wch: 25}, {wch: 20}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 20}
    ];
    ws['!cols'] = wscols;

    // Download
    XLSX.writeFile(wb, `Admin_Assets_Export_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // ... (Rest of your component logic: pagination, filters, loading states) ...
  const categories = ["All", ...new Set(dataSource.map((item) => item.assetType || item.category || "Uncategorized"))];
  const statuses = ["All", ...new Set(dataSource.map((item) => item.deviceDetails?.currentStatus || item.status || "Unknown"))];
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <div className="h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-500"><div className="flex flex-col items-center gap-2"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span><p className="text-sm font-medium">Loading Branch Inventory...</p></div></div>;
  if (error) return <div className="h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-red-500"><span className="material-symbols-outlined text-4xl mb-2">lock_person</span><p className="text-lg font-bold">Access Denied</p><p className="text-sm text-slate-500">{error}</p></div>;

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden font-display h-screen flex">
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AdminNav />

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50 dark:bg-background-dark/20">
          
          <div className="flex justify-between items-end mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight">All Assets</h1>
              <p className="text-slate-500">
                Viewing assets for <span className="font-mono font-bold text-primary">ADMIN</span>
              </p>
            </div>
            
            <button 
              onClick={handleExport} 
              className="px-4 py-2 text-sm font-bold bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">ios_share</span>
              <span>Export</span>
            </button>
          </div>

          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 border-b border-slate-200 dark:border-border-dark flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <button onClick={() => { setShowCategoryMenu(!showCategoryMenu); setShowStatusMenu(false); }} className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-border-dark rounded-lg flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-surface-dark">
                      <span className="material-symbols-outlined text-[18px]">filter_list</span>
                      <span>{selectedCategory === "All" ? "Asset Type" : selectedCategory}</span>
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </button>
                    {showCategoryMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowCategoryMenu(false)}></div>
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto">
                          {categories.map((cat) => (
                            <button key={cat} onClick={() => { setSelectedCategory(cat); setShowCategoryMenu(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedCategory === cat ? "text-primary font-bold bg-primary/5" : "text-slate-600 dark:text-slate-300"}`}>
                              {cat}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="relative group">
                    <button onClick={() => { setShowStatusMenu(!showStatusMenu); setShowCategoryMenu(false); }} className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-border-dark rounded-lg flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-surface-dark">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>{selectedStatus === "All" ? "Status" : selectedStatus}</span>
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </button>
                    {showStatusMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)}></div>
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-xl z-20 overflow-hidden max-h-60 overflow-y-auto">
                          {statuses.map((stat) => (
                            <button key={stat} onClick={() => { setSelectedStatus(stat); setShowStatusMenu(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedStatus === stat ? "text-primary font-bold bg-primary/5" : "text-slate-600 dark:text-slate-300"}`}>
                              {stat}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {(selectedCategory !== "All" || selectedStatus !== "All") && (
                    <button onClick={() => { setSelectedCategory("All"); setSelectedStatus("All"); }} className="text-xs text-red-500 hover:text-red-700 font-bold underline px-2">Reset</button>
                  )}
               </div>
               <p className="text-xs text-slate-500 font-medium italic">Showing {currentItems.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredAssets.length)} of {filteredAssets.length} assets</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-background-dark/30 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-border-dark">Asset Code</th>
                    <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-border-dark">Asset Name</th>
                    <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-border-dark">Branch</th>
                    <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-border-dark">Assigned To</th>
                    <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-border-dark">Status</th>
                    <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-border-dark text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                  {currentItems.map((asset) => (
                    <tr key={asset._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-[18px]">{asset.assetType === 'Laptop' || asset.category === 'Laptop' ? 'laptop_mac' : 'devices'}</span>
                          </div>
                          <span className="text-sm font-semibold">{asset.assetCode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{asset.assetName || asset.assetType}</td>
                      <td className="px-6 py-4">{getBranchName(asset.branchId)}</td>
                      <td className="px-6 py-4">{asset.assignedTo}</td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-500"><StatusBadge status={asset.deviceDetails?.currentStatus || asset.status || "N/A"} /></td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => navigate(`/assetdetails/${asset._id}`, { state: { asset } })} className="p-2 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[25px]">open_in_new</span></button>
                        
                        {/* 3. ADDED DELETE BUTTON HANDLER HERE */}
                        <button 
                          onClick={() => handleDelete(asset._id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[25px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {currentItems.length === 0 && (
                    <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500"><div className="flex flex-col items-center justify-center"><span className="material-symbols-outlined text-4xl mb-2 text-slate-300">inventory_2</span><p>No assets found.</p></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
                <div className="p-4 bg-slate-50 dark:bg-background-dark/30 border-t border-slate-200 dark:border-border-dark flex items-center justify-between">
                  <span className="text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="size-9 rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 transition-colors"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => {
                        if (number === 1 || number === totalPages || (number >= currentPage - 1 && number <= currentPage + 1)) {
                            return <button key={number} onClick={() => paginate(number)} className={`size-9 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${currentPage === number ? "bg-primary text-white" : "border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark hover:bg-slate-50"}`}>{number}</button>;
                        } else if ((number === currentPage - 2 && currentPage > 3) || (number === currentPage + 2 && currentPage < totalPages - 2)) {
                            return <span key={number} className="px-1 text-slate-400">...</span>;
                        }
                        return null;
                    })}
                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="size-9 rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 transition-colors"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
                  </div>
                </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Adminassets;