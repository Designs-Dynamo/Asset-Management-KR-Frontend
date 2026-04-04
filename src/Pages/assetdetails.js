import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { fetchAssetDetails } from "../utils/apiauth";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import BranchChangeWizard from "../components/Branchchangewizard";
import { getBranchName } from "../components/Branches";
import Icon from "../components/Icon";
import AdminNav from "../admincomponents/AdminNav";

const getUserRole = () => {
  const role = localStorage.getItem('userRole');
  if (role) return role;
  return 'BRANCH_USER';
};


const SpecCard = ({ title, icon, main, sub, borderClasses }) => (
  <div className={`p-5 hover:bg-slate-800/20 transition-colors ${borderClasses}`}>
    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">{title}</p>
    <div className="flex items-center gap-3">
      <Icon name={icon} className="!text-xl text-primary" />
      <div className="min-w-0">
        <p className="text-sm font-bold truncate">{main}</p>
        <p className="text-[10px] text-slate-500 truncate" dangerouslySetInnerHTML={{ __html: sub }} />
      </div>
    </div>
  </div>
);

const ImageCarousel = ({ images, category }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Fallback if no images
  if (!images || images.length === 0) {
    return (
      <div className="aspect-video bg-background-dark flex flex-col items-center justify-center text-slate-600 border border-border-dark rounded-xl">
        <span className="material-symbols-outlined text-[60px] mb-2 opacity-50">
          {category === 'Laptop' ? 'laptop_mac' : 'devices'}
        </span>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-70">No Media</p>
      </div>
    );
  }

  const handleNext = (e) => {
    e?.stopPropagation(); // Prevent triggering any parent click events
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main Display Area */}
      <div className="relative group aspect-video bg-zinc-950 border border-border-dark  overflow-hidden flex items-center justify-center shadow-inner">
        <img
          src={images[activeIndex].url}
          alt="Main Asset View"
          className="w-full h-full object-contain transition-transform duration-500"
        />

        {/* === PROFESSIONAL ARROWS === */}
        {images.length > 1 && (
          <>
            {/* Left Arrow */}
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 
                         w-10 h-10 flex items-center justify-center rounded-full 
                         bg-black/20 hover:bg-white/10 backdrop-blur-md border border-white/10 
                         text-white shadow-lg 
                         transition-all duration-300 ease-out 
                         opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>

            {/* Right Arrow */}
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 
                         w-10 h-10 flex items-center justify-center rounded-full 
                         bg-black/20 hover:bg-white/10 backdrop-blur-md border border-white/10 
                         text-white shadow-lg 
                         transition-all duration-300 ease-out 
                         opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </>
        )}

        {/* Counter Badge (Bottom Right) */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 
                        bg-black/40 backdrop-blur-md border border-white/10 rounded-full 
                        text-white text-[10px] font-bold tracking-wider shadow-sm">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails Strip */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, index) => (
            <div
              key={img._id || index}
              onClick={() => setActiveIndex(index)}
              className={`aspect-square  cursor-pointer overflow-hidden relative transition-all duration-300 ${activeIndex === index
                ? "ring-2 ring-primary ring-offset-2 ring-offset-surface-dark opacity-100"
                : "opacity-50 hover:opacity-100 grayscale hover:grayscale-0"
                }`}
            >
              <img src={img.url} className="w-full h-full object-cover" alt="Thumbnail" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Component ---
const AssetDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Initialize State
  const initialAsset = location.state?.asset || null;
  const [asset, setAsset] = useState(initialAsset);
  const [loading, setLoading] = useState(!initialAsset);
  const [error, setError] = useState(null);
  const [showTransferWizard, setShowTransferWizard] = useState(false);

  const userRole = getUserRole();

  // 2. Fetch Data
  useEffect(() => {
    if (!asset) {
      const loadAsset = async () => {
        try {
          setLoading(true);
          const data = await fetchAssetDetails(id);
          setAsset(data);
        } catch (err) {
          console.error(err);
          setError("Failed to load asset details.");
        } finally {
          setLoading(false);
        }
      };
      loadAsset();
    }
  }, [id, asset]);

  // --- Helper: Get Activity Color ---
  const getActivityColor = (action) => {
    const type = action?.toUpperCase() || "";
    if (type.includes("CREATE") || type.includes("ADD")) return "bg-emerald-500";
    if (type.includes("UPDATE") || type.includes("EDIT")) return "bg-blue-500";
    if (type.includes("DELETE") || type.includes("REMOVE")) return "bg-red-500";
    if (type.includes("MAINTENANCE")) return "bg-amber-500";
    return "bg-slate-500";
  };

  // --- Loading / Error UI ---
  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">
      <span className="material-symbols-outlined animate-spin text-4xl mb-4 text-primary">progress_activity</span>
      <p className="text-sm font-bold uppercase tracking-widest">Loading Asset Telemetry...</p>
    </div>
  );

  if (error) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-red-500">
      <span className="material-symbols-outlined text-5xl mb-4">gpp_bad</span>
      <p className="text-lg font-bold">{error}</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-sm underline hover:text-white">Go Back</button>
    </div>
  );

  if (!asset) return null;

  return (
    <div className="dark bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-300 font-display flex flex-col h-screen w-full overflow-hidden">
      {userRole === 'ADMIN' ? <AdminNav /> : <Navbar />}

      <main className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
        {/* Top Action Bar */}
        <div className="flex items-end justify-between shrink-0">
          <div>
            <nav className="flex items-center gap-1 mb-1 text-[10px] uppercase font-bold tracking-widest text-slate-500">
              <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/')}>Home</span>
              <Icon name="chevron_right" className="!text-[12px]" />
              <span className="hover:text-primary cursor-pointer" onClick={() => navigate(-1)}>Inventory</span>
              <Icon name="chevron_right" className="!text-[12px]" />
              <span className="text-primary">ID: {asset.assetCode}</span>
            </nav>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase">
                {asset.assetName || asset.name} <span className="text-slate-500 font-light">/</span> <span className="text-primary">{asset.assetCode}</span>
              </h1>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase`}>
                <StatusBadge status={asset.deviceDetails.currentStatus} />
              </span>
            </div>
            <div className="mt-1 flex items-center gap-6 text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1.5">
                <Icon name="lan" className="!text-sm" /> TYPE: {asset.assetType || asset.category}
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="sync" className="!text-sm" /> LAST UPDATED: {new Date(asset.updatedAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/assetdetails/${id}/edit`, { state: { asset } })} // Pass asset data to avoid re-fetching
              className="flex items-center gap-2 px-4 py-2 bg-surface-dark border border-border-dark hover:border-slate-500 transition-colors text-xs font-bold uppercase tracking-widest text-slate-300">
              <Icon name="edit" className="!text-sm" /> Edit Asset
            </button>
            <button onClick={() => setShowTransferWizard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-all text-xs font-bold uppercase tracking-widest">
              <Icon name="change_circle" className="!text-sm font-[30px]" /> Branch Change
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

          {/* Left Column: Gallery & Meta */}
          <div className="col-span-3 flex flex-col gap-6 min-h-0">
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark p-3">
              <ImageCarousel images={asset.images} category={asset.category} />
            </div>

            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 border-b border-border-dark flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Assignment Meta</h3>
                <Icon name="info" className="!text-sm text-slate-500" />
              </div>
              <div className="p-5 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded bg-background-dark border border-border-dark flex items-center justify-center shrink-0">
                    <Icon name="person" className="text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Current Employee</p>
                    <p className="text-sm font-bold truncate">{asset.assignedTo || "Unassigned"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Branch</p>
                    <p className="text-xs font-semibold">{getBranchName(asset.branchId)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Deployed</p>
                    <p className="text-xs font-semibold">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "N/A"}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border-dark">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-3">Procurement Detail</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Vendor:</span>
                      <span className="font-bold">{asset.assetCompany || "N/A"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Model:</span>
                      <span className="font-bold">{asset.assetModel || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column: Hardware Specs */}
          <div className="col-span-5 flex flex-col gap-6 min-h-0">
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark flex-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border-dark flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="memory" className="text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Hardware Specifications Matrix</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-1">HEALTH: 100%</span>
                  <Icon name="refresh" className="!text-sm text-slate-500 cursor-pointer" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
                <div className="grid grid-cols-2">
                  <SpecCard
                    title="Processor / CPU"
                    icon="cpu"
                    main={asset.deviceDetails?.cpu || "N/A"}
                    sub="Architecture: x64/ARM"
                    borderClasses="border-r border-b border-border-dark"
                  />
                  <SpecCard
                    title="RAM"
                    icon="memory"
                    main={asset.deviceDetails?.ram || "N/A"}
                    sub="Unified Memory"
                    borderClasses="border-b border-border-dark"
                  />
                  <SpecCard
                    title="SSD"
                    icon="storage"
                    main={asset.deviceDetails?.ssd || "N/A"}
                    sub="<span class='text-emerald-500 font-mono uppercase'>Encrypted</span>"
                    borderClasses="border-r border-b border-border-dark"
                  />
                  <SpecCard
                    title="Operating System"
                    icon="terminal"
                    main={asset.deviceDetails?.os || "N/A"}
                    sub="Version: Latest"
                    borderClasses="border-b border-border-dark"
                  />
                  <SpecCard
                    title="HDD"
                    icon="category"
                    main={asset.deviceDetails?.hdd || "None"}
                    sub={asset.assetType || "Standard"}
                    borderClasses="border-r border-b border-border-dark"
                  />
                  <SpecCard
                    title="Company"
                    icon="apartment"
                    main={asset.assetCompany}
                    borderClasses="border-b border-border-dark"
                  />
                  <SpecCard
                    title="Department"
                    icon="home"
                    main={asset?.department || "None"}
                    sub={getBranchName(asset.branchId) || "HQ"}
                    borderClasses="border-r border-b border-border-dark"
                  />
                  <SpecCard
                    title="DIVISION"
                    icon="devices"
                    main={asset?.division || "HO"}
                    borderClasses="border-b border-border-dark"
                  />

                </div>
                <div className="p-5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Extended Hardware Telemetry</p>
                  <table className="w-full text-left">
                    <thead className="border-b border-border-dark">
                      <tr className="text-[10px] text-slate-500 uppercase">
                        <th className="pb-2 font-bold">Component</th>
                        <th className="pb-2 font-bold">ID / Serial</th>
                        <th className="pb-2 font-bold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">

                      <tr className="border-b border-border-dark/50 last:border-0">
                        <td className="py-3"><span> Asset Code </span></td>
                        <td className="py-3 font-mono text-slate-500 uppercase"><span> {asset.assetCode} </span></td>
                        <td className={`py-3 text-right {}`}>{asset.deviceDetails.currentStatus}</td>
                      </tr>
                      <tr className="border-b border-border-dark/50 last:border-0">
                        <td className="py-3"><span> Asset Type </span></td>
                        <td className="py-3 font-mono text-slate-500 uppercase"><span> {asset.assetType} </span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Activity Log */}
          <div className="col-span-4 flex flex-col gap-6 min-h-0">
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark flex-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border-dark bg-slate-100/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="history" className="text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Activity & Audit Log</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Live Feed</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {asset.activity && asset.activity.length > 0 ? (
                  asset.activity.map((log, idx) => (
                    <div key={idx} className="relative pl-6 pb-4 border-l border-border-dark last:pb-0 last:border-l-0">
                      {/* Dynamic Color Dot */}
                      <div className={`absolute -left-[5px] top-0 size-2.5 rounded-full ${getActivityColor(log.action)} ring-4 ring-surface-dark`}></div>

                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold uppercase text-slate-300">{log.action || "UPDATE"}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {log.performedAt ? new Date(log.performedAt).toLocaleString() : ""}
                        </span>
                      </div>

                      <p className="text-xs font-bold mb-1 text-slate-200">
                        {typeof log.description === "object"
                          ? JSON.stringify(log.description)
                          : log.description || "System update detected"}
                      </p>

                      {log.performedBy && (
                        <p className="text-[10px] text-slate-500">
                          User: {typeof log.performedBy === "object"
                            ? log.performedBy?.name
                            : log.performedBy}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    <Icon name="history_toggle_off" className="!text-3xl mb-2 block" />
                    No activity logs found for this asset.
                  </div>
                )}
              </div>

              <div className="p-3 bg-background-dark border-t border-border-dark">
                <button className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                  Export History to .CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
      {asset && (
        <BranchChangeWizard
          isOpen={showTransferWizard}
          onClose={() => setShowTransferWizard(false)}
          asset={asset}
        />
      )}

      {/* Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2b3536; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
      `}</style>
    </div>
  );
};

export default AssetDetails;