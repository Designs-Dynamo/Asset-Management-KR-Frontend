import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; // Import SheetJS
import AdminNav from '../admincomponents/AdminNav';
import StatsCard from '../components/Statscard';
import Icon from '../components/Icon';
import { getBranchName } from "../components/Branches"; 

// --- DYNAMIC BAR CHART ---
const BarChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="p-6 text-center text-slate-400">No Data</div>;

  const maxVal = Math.max(...data.map(d => d.count));

  return (
    <div className="lg:col-span-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-slate-900 dark:text-white text-lg font-bold">Branch-wise Asset Distribution</h3>
      </div>
      <div className="h-[300px] flex items-end justify-between gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {data.map((item, index) => {
          const height = (item.count / maxVal) * 200; 
          const isHighest = item.count === maxVal;

          return (
            <div key={index} className="flex flex-col items-center gap-2 group min-w-[40px]">
              <div className="relative flex justify-center w-full">
                 <span className="absolute -top-6 text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                 </span>
                 <div 
                    className={`w-8 rounded-t-sm transition-all duration-500 ease-out ${isHighest ? 'bg-primary' : 'bg-primary/20 group-hover:bg-primary'}`} 
                    style={{ height: `${Math.max(height, 4)}px` }} 
                 ></div>
              </div>
              <span className={`text-[10px] text-slate-400 dark:text-[#a2b2b4] rotate-45 mt-2 origin-left whitespace-nowrap ${isHighest ? 'font-bold text-primary' : ''}`}>
                {getBranchName(item._id)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- DYNAMIC DONUT CHART ---
const DonutChart = ({ statusData = [], total = 0 }) => {
  
  const getCount = (status) => statusData?.find(s => s._id === status)?.count || 0;
  
  const assigned = getCount("Assigned");
  const maintenance = getCount("Maintenance");
  const unassigned = getCount("Unassigned");
  
  const pctAssigned = total > 0 ? (assigned / total) * 100 : 0;
  const pctMaint = total > 0 ? (maintenance / total) * 100 : 0;
  const pctUnassigned = total > 0 ? (unassigned / total) * 100 : 0;

  const off1 = 0; 
  const off2 = -pctAssigned; 
  const off3 = -(pctAssigned + pctMaint); 

  return (
    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-6">
      <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-6">Status Distribution</h3>
      
      {total === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          No assets found
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center relative py-4">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" fill="none" r="15.915" stroke="#f1f5f9" strokeWidth="3"></circle>
              <circle cx="18" cy="18" fill="none" r="15.915" stroke="#10b981" strokeDasharray={`${pctAssigned} ${100 - pctAssigned}`} strokeDashoffset={off1} strokeWidth="3"></circle>
              <circle cx="18" cy="18" fill="none" r="15.915" stroke="#ef4444" strokeDasharray={`${pctMaint} ${100 - pctMaint}`} strokeDashoffset={off2} strokeWidth="3"></circle>
              <circle cx="18" cy="18" fill="none" r="15.915" stroke="#f59e0b" strokeDasharray={`${pctUnassigned} ${100 - pctUnassigned}`} strokeDashoffset={off3} strokeWidth="3"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold dark:text-white">{Math.round(pctAssigned)}%</span>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Utilization</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 w-full">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-medium dark:text-slate-300">Assigned ({assigned})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-red-500"></span>
              <span className="text-xs font-medium dark:text-slate-300">Maintenance ({maintenance})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-amber-500"></span>
              <span className="text-xs font-medium dark:text-slate-300">Unassigned ({unassigned})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- DYNAMIC BRANCH TABLE ---
const BranchTable = ({ data }) => {
  return (
    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
        <h2 className="text-slate-900 dark:text-white text-xl font-bold">Branch Breakdown</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-background-dark/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Branch Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Branch ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Assets</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Allocation %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
            {data.map((branch, index) => (
              <tr key={index} className="hover:bg-slate-50 dark:hover:bg-border-dark/30 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{getBranchName(branch._id)}</td>
                <td className="px-6 py-4 text-sm font-mono text-slate-500">{branch._id}</td>
                <td className="px-6 py-4 text-sm font-bold dark:text-slate-300">{branch.count}</td>
                <td className="px-6 py-4">
                  <div className="w-full bg-slate-200 dark:bg-background-dark rounded-full h-1.5 max-w-[100px]">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min((branch.count/10)*100, 100)}%` }}></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- REQUEST HISTORY TABLE ---
const RequestHistoryTable = ({ history }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  if (!history || history.length === 0) return null;

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl overflow-hidden mt-8">
      <div className="px-6 py-5 border-b border-slate-200 dark:border-border-dark flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
        <div className="flex items-center gap-2">
          <Icon name="history" className="text-primary" />
          <h2 className="text-slate-900 dark:text-white text-xl font-bold">Recent Request History</h2>
        </div>
        <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-slate-500 font-medium">Last 30 Days Log</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-background-dark/50">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Code</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Branch</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Requested By</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
            {currentItems.map((req, index) => (
              <tr key={index} className="hover:bg-slate-50 dark:hover:bg-border-dark/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{req.assetId?.assetCode}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">{getBranchName(req.branchId)}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{req.requestedBy}</td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {req.resolvedAt ? new Date(req.resolvedAt).toLocaleDateString() : "-"}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    req.status === 'APPROVED' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' 
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                  }`}>
                    {req.status === 'APPROVED' && <Icon name="check" className="text-[10px] mr-1" />}
                    {req.status === 'REJECTED' && <Icon name="close" className="text-[10px] mr-1" />}
                    {req.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {history.length > itemsPerPage && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-border-dark flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
          <p className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-700 dark:text-slate-300">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, history.length)}</span> of {history.length}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={handlePrev} 
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-border-dark text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1 px-2">
                <span className="text-xs text-slate-400">Page {currentPage} of {totalPages}</span>
            </div>
            <button 
              onClick={handleNext} 
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-border-dark text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN PAGE ---
const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const res = await axios.get("https://kr-asset-backend.vercel.app/api/assets/analytics", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  // --- EXPORT FUNCTION (COMPREHENSIVE) ---
  const handleExport = () => {
    if (!data) return;

    // 1. Sheet 1: Dashboard Summary
    const summaryData = [
      { Metric: "Total Assets", Value: data.summary.total },
      { Metric: "Assets In Maintenance", Value: data.summary.maintenance },
      { Metric: "New Assets (Last 30 Days)", Value: data.summary.new },
      { Metric: "Total Estimated Valuation", Value: data.summary.valuation },
      { Metric: "Report Generated On", Value: new Date().toLocaleString() }
    ];

    // 2. Sheet 2: Branch Analytics
    const branchData = data.byBranch.map(b => ({
      "Branch ID": b._id,
      "Branch Name": getBranchName(b._id),
      "Total Assets": b.count,
      "Utilization": `${((b.count / data.summary.total) * 100).toFixed(1)}%`
    }));

    // 3. Sheet 3: Status Analytics
    const statusData = data.byStatus.map(s => ({
      "Status Category": s._id,
      "Count": s.count,
      "Percentage": `${((s.count / data.summary.total) * 100).toFixed(1)}%`
    }));

    // 4. Sheet 4: Request History Log
    const historyData = data.requestHistory.map(req => ({
      "Request Status": req.status,
      "Asset Code": req.assetId?.assetCode || "N/A",
      "Branch ID": req.branchId,
      "Branch Name": getBranchName(req.branchId),
      "Requested By": req.requestedBy,
      "Admin Notes": req.notes || ""
    }));

    // Create Workbook
    const wb = XLSX.utils.book_new();

    // Add Sheets
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    const wsBranch = XLSX.utils.json_to_sheet(branchData);
    const wsStatus = XLSX.utils.json_to_sheet(statusData);
    const wsHistory = XLSX.utils.json_to_sheet(historyData);

    // Set Column Widths for readability
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 30 }];
    wsBranch['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }];
    wsStatus['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 15 }];
    wsHistory['!cols'] = [{ wch: 22 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 40 }];

    XLSX.utils.book_append_sheet(wb, wsSummary, "Executive Summary");
    XLSX.utils.book_append_sheet(wb, wsBranch, "Branch Data");
    XLSX.utils.book_append_sheet(wb, wsStatus, "Status Data");
    XLSX.utils.book_append_sheet(wb, wsHistory, "Request Audit Log");

    // Download
    XLSX.writeFile(wb, `Full_Asset_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
            <Icon name="sync" className="animate-spin text-3xl text-primary" />
        </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display">
      <AdminNav />
      <main className="max-w-[1440px] mx-auto px-4 md:px-10 py-8">
        
        {/* Header Section */}
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Asset Intelligence</h1>
            <p className="text-slate-500 dark:text-[#a2b2b4] text-base font-normal">Real-time performance metrics across {data?.byBranch.length || 0} active branches.</p>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 h-10 rounded-lg bg-primary text-white text-sm font-bold hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
             <Icon name="download" className="text-[18px]" />
             <span>Export Report</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Total Assets" 
            icon="inventory_2" 
            value={data?.summary.total} 
            change="Live" 
            isPositive={true} 
            trendIcon="sensors" 
          />
          <StatsCard 
            title="In Maintenance" 
            icon="build" 
            value={data?.summary.maintenance} 
            change="Attention" 
            isPositive={false} 
            trendIcon="warning" 
            iconColor="text-[#fa5c38]" 
          />
          <StatsCard 
            title="New (30 Days)" 
            icon="shopping_cart" 
            value={data?.summary.new} 
            change="Growth" 
            isPositive={true} 
            trendIcon="trending_up" 
          />
          <StatsCard 
            title="Est. Valuation" 
            icon="payments" 
            value={`$${(data?.summary.valuation / 1000).toFixed(1)}k`} 
            change="Approx" 
            isPositive={true} 
            trendIcon="attach_money" 
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <BarChart data={data?.byBranch} />
          <DonutChart statusData={data?.byStatus} total={data?.summary.total} />
        </div>

        {/* Data Tables */}
        <BranchTable data={data?.byBranch || []} />
        
        {/* History Table */}
        <RequestHistoryTable history={data?.requestHistory || []} />

      </main>

      {/* Global CSS for scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
};

export default Reports;