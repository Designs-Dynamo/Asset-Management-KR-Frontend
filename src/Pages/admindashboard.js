import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNav from "../admincomponents/AdminNav";
import Footer from "../components/Footer";
import StatsCard from "../components/Statscard";
import Icon from "../components/Icon";
import { fetchallAssets } from "../utils/apiauth";

// --- SUB-COMPONENT: VALUATION TREND CHART (Visual Only) ---
const ValuationChart = ({ totalValue }) => {
  const data = [2.1, 2.2, 2.15, 2.3, 2.45, 2.4];
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d - 2.0) / (2.5 - 2.0)) * 80;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-6 relative overflow-hidden h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
            Financial Health
          </h3>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ₹{totalValue.toLocaleString()}
            <span className="text-sm font-bold text-emerald-500 ml-2">↑ YTD</span>
          </h2>
        </div>
        <button className="p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">
          <Icon name="more_horiz" />
        </button>
      </div>

      <div className="h-32 w-full relative">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`M0,100 L${points} L100,100 Z`} fill="url(#gradient)" />
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: AGING DISTRIBUTION ---
const AgingWidget = ({ agingData }) => (
  <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-6 h-full">
    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
      <Icon name="timelapse" className="text-primary" /> Asset Lifecycle
    </h3>
    <div className="space-y-5">
      {agingData.map((item, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
            <span className="text-slate-400">{item.count} Units</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${item.color}`}
              style={{ width: `${item.percent}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- SUB-COMPONENT: WARRANTY EXPIRY LIST ---
const WarrantyWidget = ({ assets }) => (
  <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl overflow-hidden flex flex-col h-full">
    <div className="p-5 border-b border-slate-200 dark:border-border-dark flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Icon name="verified_user" className="text-red-500" /> Warranty Expiry (Next 60 Days)
      </h3>
      <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-md">
        {assets.length} Alerts
      </span>
    </div>
    <div className="p-0 flex-1 overflow-y-auto custom-scrollbar h-[250px]">
      {assets.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm">
          No warranties expiring soon.
        </div>
      ) : (
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-background-dark/50 text-[10px] uppercase text-slate-500 font-bold sticky top-0">
            <tr>
              <th className="px-5 py-3">Asset</th>
              <th className="px-5 py-3 text-right">Days Left</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-border-dark text-sm">
            {assets.map((item, i) => (
              <tr
                key={i}
                className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3">
                  <p className="font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                  <p className="text-[10px] font-mono text-slate-400">{item.id}</p>
                </td>
                <td className="px-5 py-3 text-right">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
                      item.daysLeft < 15
                        ? "text-red-600 bg-red-50 dark:bg-red-500/10"
                        : "text-amber-600 bg-amber-50 dark:bg-amber-500/10"
                    }`}
                  >
                    {item.daysLeft} Days
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    maintenance: 0,
    unassigned: 0,
  });
  const [requestStats, setRequestStats] = useState({ pending: 0 });

  // Advanced Analytics State
  const [totalValuation, setTotalValuation] = useState(0);
  const [agingData, setAgingData] = useState([]);
  const [expiringWarranties, setExpiringWarranties] = useState([]);

  useEffect(() => {
    document.title = "KR Asset Management | Admin Panel";

    const loadData = async () => {
      try {
        setLoading(true);
        const [assetData, requestData] = await Promise.all([
          fetchallAssets(),
        ]);

// ADD THESE TEMPORARILY
console.log("RAW assetData:", assetData);
console.log("RAW requestData:", requestData);
console.log("Is array?", Array.isArray(assetData));
console.log("Length:", assetData?.length);

        // Safely extract arrays
        const assetList = Array.isArray(assetData)
          ? assetData
          : assetData?.assets || assetData?.data || [];

        const requestList = Array.isArray(requestData)
          ? requestData
          : requestData?.requests || requestData?.data || [];

        // 1. Core Stats — status lives in deviceDetails.currentStatus
        const total = assetList.length;

        const assigned = assetList.filter(
          (a) => a.deviceDetails?.currentStatus === "Assigned"
        ).length;

        const maintenance = assetList.filter(
          (a) => a.deviceDetails?.currentStatus === "Maintenance"
        ).length;

        const unassigned = assetList.filter(
          (a) => a.deviceDetails?.currentStatus === "Unassigned"
        ).length;

        const pending = requestList.filter((r) => r.status === "PENDING").length;

        setStats({ total, assigned, maintenance, unassigned });
        setRequestStats({ pending });

        // 2. Financial Valuation (Sum of price field)
        const valuation = assetList.reduce(
          (sum, asset) => sum + (Number(asset.price) || 0),
          0
        );
        setTotalValuation(valuation);

        // 3. Aging Distribution + Warranty Expiry
        const now = new Date();
        const agingCounts = { "<1": 0, "1-3": 0, "3-5": 0, ">5": 0 };
        const warrantyList = [];

        assetList.forEach((asset) => {
          if (asset.purchaseDate) {
            const pDate = new Date(asset.purchaseDate);
            const ageYears = (now - pDate) / (1000 * 60 * 60 * 24 * 365);

            // Age Bucket
            if (ageYears < 1) agingCounts["<1"]++;
            else if (ageYears < 3) agingCounts["1-3"]++;
            else if (ageYears < 5) agingCounts["3-5"]++;
            else agingCounts[">5"]++;

            // Warranty Logic (Assuming 1 year warranty)
            const warrantyEnd = new Date(pDate);
            warrantyEnd.setFullYear(warrantyEnd.getFullYear() + 1);
            const daysLeft = Math.ceil(
              (warrantyEnd - now) / (1000 * 60 * 60 * 24)
            );

            if (daysLeft > 0 && daysLeft <= 60) {
              warrantyList.push({
                id: asset.assetCode,
                // FIXED: use deviceDetails.deviceName instead of assetName
                name: asset.deviceDetails?.deviceName || asset.assetType || "Unknown Asset",
                daysLeft,
              });
            }
          }
        });

        // Guard against division by zero in percent
        setAgingData([
          {
            label: "< 1 Year",
            count: agingCounts["<1"],
            percent: total > 0 ? (agingCounts["<1"] / total) * 100 : 0,
            color: "bg-emerald-500",
          },
          {
            label: "1-3 Years",
            count: agingCounts["1-3"],
            percent: total > 0 ? (agingCounts["1-3"] / total) * 100 : 0,
            color: "bg-blue-500",
          },
          {
            label: "3-5 Years",
            count: agingCounts["3-5"],
            percent: total > 0 ? (agingCounts["3-5"] / total) * 100 : 0,
            color: "bg-amber-500",
          },
          {
            label: "> 5 Years",
            count: agingCounts[">5"],
            percent: total > 0 ? (agingCounts[">5"] / total) * 100 : 0,
            color: "bg-red-500",
          },
        ]);

        setExpiringWarranties(
          warrantyList.sort((a, b) => a.daysLeft - b.daysLeft)
        );
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined animate-spin text-3xl text-primary">
            progress_activity
          </span>
          <p className="text-sm font-medium">Loading Admin Insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden font-display h-screen flex">
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <AdminNav />

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/50 dark:bg-background-dark/20">

          {/* Header */}
          <div className="flex justify-between items-end mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight">Executive Overview</h1>
              <p className="text-slate-500">
                Global asset performance and financial health metrics.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/reports")}
                className="px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <Icon name="bar_chart" className="text-[18px]" /> View Full Reports
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatsCard title="Total Assets" icon="inventory_2" value={stats.total} isPositive={true} />
            <StatsCard title="Assigned" icon="check_circle" value={stats.assigned} isPositive={true} iconColor="text-green-500" />
            <StatsCard title="Unassigned" icon="cancel" value={stats.unassigned} isPositive={false} iconColor="text-red-500" />
            <StatsCard title="In Maintenance" icon="build" value={stats.maintenance} isPositive={false} iconColor="text-[#d8e2dc]" />
            <StatsCard title="Pending Requests" icon="pending_actions" value={requestStats.pending} isPositive={true} iconColor="text-amber-600" />
          </div>

          {/* --- STRATEGIC WIDGETS ROW --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 h-[350px]">
            {/* 1. Valuation Trend */}
            <div className="lg:col-span-2 h-full">
              <ValuationChart totalValue={totalValuation} />
            </div>
            {/* 2. Asset Aging */}
            <div className="h-full">
              <AgingWidget agingData={agingData} />
            </div>
          </div>

          {/* --- OPERATIONAL ROW --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[350px]">
            {/* 3. Warranty Alerts */}
            <WarrantyWidget assets={expiringWarranties} />

            {/* 4. System Health Panel */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-6 flex flex-col">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <Icon name="monitor_heart" className="text-primary" /> System Health
              </h3>
              <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
                {requestStats.pending > 5 && (
                  <div className="flex gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                    <Icon name="warning" className="text-amber-500 text-xl mt-1" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Request Backlog
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {requestStats.pending} requests pending. Approval required.
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark">
                  <Icon name="cloud_sync" className="text-blue-500 text-xl mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Data Sync Active
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Real-time stats are up to date.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;