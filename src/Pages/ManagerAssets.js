import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getAuthData } from "../utils/url"; // Using the utility we discussed
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatsCard from "../components/Statscard";
import Icon from "../components/Icon";
import ManagerNavbar from "../components/ManagerNavbar";

// --- REUSED SUB-COMPONENTS FROM ADMIN ---
const ValuationChart = ({ totalValue }) => {
  const data = [2.1, 2.2, 2.15, 2.3, 2.45, 2.4];
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - ((d - 2.0) / (2.5 - 2.0)) * 80}`).join(" ");

  return (
    <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-6 relative overflow-hidden h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Regional Value</h3>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{totalValue.toLocaleString()}</h2>
        </div>
        <Icon name="trending_up" className="text-emerald-500" />
      </div>
      <div className="h-32 w-full relative">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

const AgingWidget = ({ agingData }) => (
  <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-6 h-full">
    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
      <Icon name="timelapse" className="text-primary" /> Regional Asset Age
    </h3>
    <div className="space-y-5">
      {agingData.map((item, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
            <span className="text-slate-400">{item.count} Units</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
            <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.percent}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { regionId: urlRegionId } = useParams();
  const [loading, setLoading] = useState(true);

  // States
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState({ total: 0, assigned: 0, maintenance: 0, unassigned: 0 });
  const [totalValuation, setTotalValuation] = useState(0);
  const [agingData, setAgingData] = useState([]);

  useEffect(() => {
    const loadManagerData = async () => {
      try {
        setLoading(true);
        const auth = getAuthData();
        const targetRegion = urlRegionId || auth?.regionId;

        if (!targetRegion) {
          navigate("/");
          return;
        }

        const res = await axios.get(`https://kr-asset-backend.vercel.app/api/assets/manager/${targetRegion}`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });

        const assetList = res.data || [];
        setAssets(assetList);
        console.log(assetList);

        // 1. Calculate Stats
        const total = assetList.length;
        const assigned = assetList.filter(a => a.deviceDetails?.currentStatus === "Assigned").length;
        const maintenance = assetList.filter(a => a.deviceDetails?.currentStatus === "Maintenance").length;
        const unassigned = assetList.filter(a => a.deviceDetails?.currentStatus === "Unassigned").length;
        
        setStats({ total, assigned, maintenance, unassigned });

        // 2. Financials
        const valuation = assetList.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
        setTotalValuation(valuation);

        // 3. Aging
        const now = new Date();
        const agingCounts = { "<1": 0, "1-3": 0, "3-5": 0, ">5": 0 };
        assetList.forEach(asset => {
          if (asset.purchaseDate) {
            const ageYears = (now - new Date(asset.purchaseDate)) / (1000 * 60 * 60 * 24 * 365);
            if (ageYears < 1) agingCounts["<1"]++;
            else if (ageYears < 3) agingCounts["1-3"]++;
            else if (ageYears < 5) agingCounts["3-5"]++;
            else agingCounts[">5"]++;
          }
        });

        setAgingData([
          { label: "< 1 Year", count: agingCounts["<1"], percent: total > 0 ? (agingCounts["<1"]/total)*100 : 0, color: "bg-emerald-500" },
          { label: "1-3 Years", count: agingCounts["1-3"], percent: total > 0 ? (agingCounts["1-3"]/total)*100 : 0, color: "bg-blue-500" },
          { label: "3-5 Years", count: agingCounts["3-5"], percent: total > 0 ? (agingCounts["3-5"]/total)*100 : 0, color: "bg-amber-500" },
          { label: "> 5 Years", count: agingCounts[">5"], percent: total > 0 ? (agingCounts[">5"]/total)*100 : 0, color: "bg-red-500" },
        ]);

      } catch (err) {
        console.error("Dashboard Load Error", err);
      } finally {
        setLoading(false);
      }
    };

    loadManagerData();
  }, [urlRegionId, navigate]);

  if (loading) return <div className="h-screen flex items-center justify-center dark:bg-background-dark">Loading Regional Insights...</div>;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-slate-900 dark:text-slate-100 font-display flex flex-col">
      <ManagerNavbar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Regional Dashboard</h1>
            <p className="text-slate-500">Insights for Region: <span className="text-primary font-bold">{urlRegionId}</span></p>
          </div>
          <button onClick={() => navigate(`/${urlRegionId}/manager/requests` )} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20">
            Handle Requests
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Total Region Assets" icon="inventory_2" value={stats.total} isPositive={true} />
          <StatsCard title="In Use" icon="check_circle" value={stats.assigned} isPositive={true} iconColor="text-emerald-500" />
          <StatsCard title="Available" icon="pause_circle" value={stats.unassigned} isPositive={true} iconColor="text-blue-500" />
          <StatsCard title="Maintenance" icon="settings_suggest" value={stats.maintenance} isPositive={false} iconColor="text-amber-500" />
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 h-[350px]">
            <ValuationChart totalValue={totalValuation} />
          </div>
          <div className="h-[350px]">
            <AgingWidget agingData={agingData} />
          </div>
        </div>

        {/* Asset Table (Your old view, integrated) */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-border-dark font-bold">Recent Region Inventory</div>
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-background-dark/30 sticky top-0">
                <tr className="text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-border-dark">
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                {assets.slice(0, 10).map((asset) => (
                  <tr key={asset._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-sm">
                    <td className="px-6 py-4 font-bold">{asset.deviceDetails?.deviceName || asset.assetType}</td>
                    <td className="px-6 py-4">{asset.branchId}</td>
                    <td className="px-6 py-4 text-xs font-bold uppercase">{asset.deviceDetails?.currentStatus}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => navigate(`/assetdetails/${asset._id}`)} className="text-primary hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default ManagerDashboard;