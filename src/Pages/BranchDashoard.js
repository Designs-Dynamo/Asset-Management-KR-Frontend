import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatsCard from '../components/Statscard';
import StatusBadge from '../components/StatusBadge';
import { fetchBranchAssets } from "../utils/apiauth";
import Icon from '../components/Icon'; // Ensure this is imported

// --- SUB-COMPONENT: SPARE INVENTORY WIDGET ---
const SpareInventoryCard = ({ count, total }) => {
  const percentage = total > 0 ? Math.min((count / 10) * 100, 100) : 0;
  const isCritical = count < 3;

  return (
    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-6 flex flex-col justify-between relative overflow-hidden">
      <div className="flex justify-between items-start z-10">
        <div>
          <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Spare Inventory</h3>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{count} <span className="text-sm font-medium text-slate-400">Available</span></h2>
        </div>
        <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
          <Icon name={isCritical ? "warning" : "inventory"} />
        </div>
      </div>

      <div className="mt-6 z-10">
        <div className="flex justify-between text-xs font-bold mb-2">
          <span className={isCritical ? "text-red-500" : "text-emerald-500"}>{isCritical ? "Low Stock Warning" : "Healthy Level"}</span>
          <span className="text-slate-400">{count} / 10 Target</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div className={`h-2.5 rounded-full transition-all duration-500 ${isCritical ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
      <Icon name="inventory_2" className="absolute -bottom-4 -right-4 text-[100px] text-slate-50 dark:text-white/5 z-0" />
    </div>
  );
};

// --- MAIN COMPONENT ---
const BranchDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize Stats
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    maintenance: 0,
    pending: 0,
    spares: 0 // New Stat
  });

  // New State for computed lists
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [topEmployees, setTopEmployees] = useState([]);
  const { branchId } = useParams();

  useEffect(() => {

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchBranchAssets(); 
        const assetList = data || [];
        setAssets(assetList);

        // --- CALCULATE REAL-TIME STATS ---
        const total = assetList.length;
        
        const assignedAssets = assetList.filter(a => 
          a.status === 'Assigned' || a.status === 'Active' || a.deviceDetails?.currentStatus === 'Assigned'
        );
        const assigned = assignedAssets.length;

        const maintenanceAssets = assetList.filter(a => 
          a.status === 'Maintenance' || a.status === 'Repair' || a.deviceDetails?.currentStatus === 'Maintenance'
        );
        const maintenance = maintenanceAssets.length;

        const spares = assetList.filter(a => 
          a.status === 'Unassigned' || a.status === 'In Stock' || a.deviceDetails?.currentStatus === 'Unassigned'
        ).length;

        // --- COMPUTE TOP EMPLOYEES (Custody List) ---
        const empCounts = {};
        assignedAssets.forEach(a => {
            if(a.assignedTo) {
                empCounts[a.assignedTo] = (empCounts[a.assignedTo] || 0) + 1;
            }
        });
        const sortedEmps = Object.entries(empCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 4); // Top 4

        setTopEmployees(sortedEmps);
        setMaintenanceList(maintenanceAssets.slice(0, 5)); // Show top 5 in repair

        setStats({
          total,
          assigned,
          maintenance,
          pending: 5, // Placeholder
          spares
        });

      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden font-display h-screen flex">
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar />

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50 dark:bg-background-dark/20">
          
          {/* Page Title */}
          <div className="flex justify-between items-end mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight">Branch Overview</h1>
              <p className="text-slate-500">Managing inventory for <span className="text-slate-900 dark:text-white font-semibold">{branchId}</span></p>
            </div>
            <button className="px-4 py-2 text-sm font-bold bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">ios_share</span>
              <span>Export Data</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatsCard title="Total Assets" icon="inventory_2" value={loading ?"..." :stats.total} isPositive={true} />
            <StatsCard title="Assigned" icon="check_circle" value={loading ?"..." :stats.assigned} isPositive={true} iconColor="text-green-500" />
            <StatsCard title="In Maintenance" icon="build" value={loading ?"..." :stats.maintenance} isPositive={false} iconColor="text-amber-500" />
            {/* Replaced generic maintenance card with actionable widget logic later, keeping layout */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                 
                 
            </div>
          </div>

          {/* --- NEW SECTION: OPERATIONAL WIDGETS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* 1. Spare Inventory Widget */}
            <SpareInventoryCard count={stats.spares} total={stats.total} />

            {/* 2. Top Custody List */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold flex items-center gap-2"><Icon name="badge" className="text-primary" /> Top Assignees</h3>
                </div>
                <div className="space-y-3">
                    {topEmployees.length === 0 ? <p className="text-xs text-slate-400">No assignments found.</p> : 
                     topEmployees.map((emp, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">{emp.name.charAt(0)}</div>
                                <p className="text-sm font-bold">{emp.name}</p>
                            </div>
                            <span className="text-xs font-black bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{emp.count} Assets</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Maintenance Quick List */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold flex items-center gap-2"><Icon name="build" className="text-amber-500" /> In Repair</h3>
                </div>
                <div className="space-y-3">
                    {maintenanceList.length === 0 ? <p className="text-xs text-slate-400 italic">No assets currently in repair.</p> :
                     maintenanceList.map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <div>
                                <p className="text-xs font-bold">{item.assetName || item.deviceDetails?.deviceName || "Unknown Device"}</p>
                                <p className="text-[10px] font-mono text-slate-400">{item.assetCode}</p>
                            </div>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Pending</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* Table Container (Existing) */}
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden flex flex-col">
            
            {/* Table Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-border-dark flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <button className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-border-dark rounded-lg flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                    <span>Asset Type</span>
                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium italic">Showing {assets.length} assets</p>
            </div>

            {/* Table Wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-background-dark/30 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-border-dark">Asset ID</th>
                    <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-border-dark">Asset Name</th>
                    <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-border-dark">Category</th>
                    <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-border-dark">Assigned To</th>
                    <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-border-dark">Status</th>
                    <th className="px-6 py-4 font-bold border-b border-slate-200 dark:border-border-dark text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                  {assets.map((asset, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4 text-sm font-mono text-slate-500">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{asset.assetCode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">{asset.assetName || asset.deviceDetails?.deviceName || "N/A"}</td>
                      <td className="px-6 py-4 text-sm">{asset.assetType}</td>
                      <td className={`px-6 py-4 text-sm font-medium ${asset.assignedTo ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 italic'}`}>
                        {asset.assignedTo || "Unassigned"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={asset.status || asset.deviceDetails?.currentStatus || "Unknown"} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default BranchDashboard;