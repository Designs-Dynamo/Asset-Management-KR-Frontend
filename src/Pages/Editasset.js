import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import Navbar from '../components/Navbar';
import { fetchAssetDetails } from "../utils/apiauth"; 
import AdminNav from '../admincomponents/AdminNav';

// --- Helper Functions ---
const getUserRole = () => {
  const role = localStorage.getItem('userRole');
  if (role) return role;
  return 'BRANCH_USER'; 
};

// --- Sub-Components ---

const Icon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const ChangeAlert = ({ change }) => {
  if (!change) return null;
  return (
    <div className="mt-2 flex items-center gap-2 text-xs font-bold text-warning-amber animate-in fade-in slide-in-from-top-1">
      <Icon name="history" className="text-sm" />
      <span>Changed: <span className="line-through opacity-60 mr-1">{change.original || "Empty"}</span> <Icon name="arrow_right_alt" className="text-[10px] align-middle" /> '{change.current}'</span>
    </div>
  );
};

// NEW: Component for Cost Inputs
const PriceInput = ({ label, name, value, onChange }) => (
  <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
    <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold"></div>
      <input 
        type="number" 
        name={name} 
        value={value} 
        onChange={onChange} 
        placeholder="0.00"
        className="w-full bg-white dark:bg-background-dark border border-emerald-200 dark:border-emerald-500/30 rounded-md pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" 
      />
    </div>
  </div>
);

const StepIndicator = ({ step }) => (
  <div className="bg-white dark:bg-surface-dark p-2 rounded-2xl border border-slate-200 dark:border-border-dark flex items-center gap-2 min-w-[280px] sm:min-w-[440px]">
    {/* Step 1 Indicator */}
    <div className={`flex items-center gap-4 flex-1 py-3 px-4 sm:px-6 rounded-xl transition-all ${step === 1 ? "bg-primary/5 text-primary font-bold" : "text-slate-400 font-medium"}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${step === 1 ? "bg-primary text-white" : "bg-slate-100 dark:bg-background-dark"}`}>
        <Icon name="edit_note" className="text-xl" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-[0.2em] opacity-70">Step 01</span>
        <span className="text-sm whitespace-nowrap">Edit Details</span>
      </div>
    </div>
    <Icon name="arrow_forward_ios" className="text-slate-300 dark:text-slate-700 text-sm" />
    {/* Step 2 Indicator */}
    <div className={`flex items-center gap-4 flex-1 py-3 px-4 sm:px-6 rounded-xl transition-all ${step === 2 ? "bg-primary/5 text-primary font-bold" : "text-slate-400 font-medium"}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${step === 2 ? "bg-primary text-white" : "bg-slate-100 dark:bg-background-dark"}`}>
        <Icon name="fact_check" className="text-xl" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-[0.2em] opacity-70">Step 02</span>
        <span className="text-sm whitespace-nowrap">Review Details</span>
      </div>
    </div>
  </div>
);

// --- Main Component ---

const ManageAsset = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [initialData, setInitialData] = useState(null);
  const [formData, setFormData] = useState(null);
  const userRole = getUserRole();

  // --- NEW: Extra Costs State ---
  const [extraCosts, setExtraCosts] = useState({
    pram: '',
    pssd: '',
    phdd: '',
    pother: '' // Repair/Service cost
  });

  // --- Image State ---
  const [existingImages, setExistingImages] = useState([]); 
  const [selectedFiles, setSelectedFiles] = useState([]);   
  const [previewUrls, setPreviewUrls] = useState([]);       

  // --- Load Data ---
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        let data = location.state?.asset;

        if (!data && id) {
          data = await fetchAssetDetails(id);
        }

        if (data) {
          const mappedData = {
            assetType: data.assetType || "Laptop",
            company: data.assetCompany || "",
            purchaseDate: data.purchaseDate ? data.purchaseDate.split('T')[0] : "",
            department: data.department || "",
            assignedTo: data.assignedTo || "",
            deviceName: data.deviceDetails?.deviceName || "",
            cpu: data.deviceDetails?.cpu || data.deviceDetails?.processor || "",
            ram: data.deviceDetails?.ram || "",
            ssd: data.deviceDetails?.ssd || data.deviceDetails?.storage || "",
            hdd: data.deviceDetails?.hdd || "None",
            os: data.deviceDetails?.os || "",
            status: data.status || "Assigned",
            notes: data.notes || ""
          };
          setInitialData(mappedData);
          setFormData(mappedData);
          
          if (data.images && data.images.length > 0) {
            setExistingImages(data.images);
          }
        }
      } catch (error) {
        console.error("Failed to load asset", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Handle Cost Change ---
  const handleCostChange = (e) => {
    const { name, value } = e.target;
    setExtraCosts(prev => ({ ...prev, [name]: value }));
  };

  // --- Image Handlers ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setSelectedFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeNewFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // --- Change Detection ---
  const changes = useMemo(() => {
    if (!initialData || !formData) return {};
    const diffs = {};
    Object.keys(formData).forEach(key => {
      if (String(formData[key]) !== String(initialData[key])) {
        diffs[key] = { current: formData[key], original: initialData[key] };
      }
    });
    return diffs;
  }, [formData, initialData]);

  // Enable commit if: Fields Changed OR Files Added OR Prices Added
  const hasChanges = Object.keys(changes).length > 0 || selectedFiles.length > 0 || Object.values(extraCosts).some(val => val !== '');

  // --- API SUBMISSION LOGIC ---
  const handleSubmit = async () => {
    if (!hasChanges) return;
    setSubmitting(true);

    try {
      const userRole = getUserRole(); 
      const data = new FormData();

      // 1. Meta
      data.append('updatedAssetMeta', JSON.stringify({
        assetType: formData.assetType,
        assetCompany: formData.company,
        purchaseDate: formData.purchaseDate,
        department: formData.department,
        assignedTo: formData.assignedTo 
      }));

      // 2. Device Details
      data.append('updatedDeviceDetails', JSON.stringify({
        deviceName: formData.deviceName,
        cpu: formData.cpu,
        ram: formData.ram,
        ssd: formData.ssd,
        hdd: formData.hdd,
        os: formData.os,
        currentStatus: formData.status
      }));

      // 3. Extra Prices (New Field)
      data.append('updatedextraprice', JSON.stringify(extraCosts));

      // 4. Notes
      data.append('notes', formData.notes);

      // 5. Images
      selectedFiles.forEach((file) => {
        data.append('images', file); 
      });

      let endpoint = userRole === 'ADMIN' 
        ? `https://asset-management-and-tracking-syste.vercel.app/api/asset-update/admin/${id}` 
        : `https://asset-management-and-tracking-syste.vercel.app/api/asset-update/${id}`;

      const token = localStorage.getItem("authToken");
      
      await axios.post(endpoint, data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });

      navigate('/success', { 
        state: { assetId: id } 
      });

    } catch (error) {
      console.error("Update failed:", error);
      const msg = error.response?.data?.message || "Failed to update asset.";
      alert(`Error: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center text-slate-500">
        <div className="flex flex-col items-center gap-2">
          <Icon name="sync" className="animate-spin text-3xl text-primary" />
          <p className="text-sm font-bold uppercase tracking-widest">Loading Asset Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen pb-32 font-display">
      {userRole === 'ADMIN' ? <AdminNav /> : <Navbar />}

      <main className="w-full max-w-[1440px] mx-auto px-4 md:px-12 py-10">
        
        {/* Navigation & Title */}
        <nav className="flex items-center gap-2 mb-8">
          <span onClick={() => navigate(-1)} className="cursor-pointer text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary flex items-center gap-1">
            <Icon name="arrow_back" className="text-base" /> Cancel
          </span>
          <Icon name="chevron_right" className="text-sm text-slate-600" />
          <span className="text-sm font-semibold text-slate-900 dark:text-white">Edit Asset <span className="text-primary font-mono ml-2">#{id?.slice(-6)}</span></span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">Edit Asset</h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
              {step === 1 ? "Step 1 of 2: Update core details, hardware specs, and repair costs." : "Step 2 of 2: Please verify the accuracy of the details before final commit."}
            </p>
          </div>
          <StepIndicator step={step} />
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          
          {/* STEP 1 CONTENT */}
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* Metadata Section */}
                <section className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
                  <div className="px-8 py-6 border-b border-slate-100 dark:border-border-dark flex items-center gap-4 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Icon name="dataset" /></div>
                    <h2 className="text-xl font-extrabold">Asset Metadata</h2>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">Asset Type</label>
                      <select name="assetType" value={formData.assetType} onChange={handleChange} className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark rounded-xl px-5 py-4 focus:ring-4 focus:ring-primary/20 transition-all outline-none">
                        <option>Laptop</option><option>Desktop</option><option>Printer</option><option>Mobile</option>
                      </select>
                      <ChangeAlert change={changes.assetType} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">Asset Company</label>
                      <input name="company" value={formData.company} onChange={handleChange} className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark rounded-xl px-5 py-4 outline-none" type="text" />
                      <ChangeAlert change={changes.company} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">Department</label>
                      <input name="department" value={formData.department} onChange={handleChange} className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark rounded-xl px-5 py-4 outline-none" type="text" placeholder="e.g. IT, HR" />
                      <ChangeAlert change={changes.department} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">Purchase Date</label>
                      <input name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark rounded-xl px-5 py-4 outline-none" type="date" />
                      <ChangeAlert change={changes.purchaseDate} />
                    </div>
                  </div>
                </section>

                {/* Specs Section - WITH PRICE INPUTS */}
                <section className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
                  <div className="px-8 py-6 border-b border-slate-100 dark:border-border-dark flex items-center gap-4 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Icon name="developer_board" /></div>
                    <h2 className="text-xl font-extrabold">Device Specifications</h2>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">Device Name</label>
                      <input name="deviceName" value={formData.deviceName} onChange={handleChange} className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark rounded-xl px-5 py-4 outline-none" type="text" />
                      <ChangeAlert change={changes.deviceName} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">CPU</label>
                      <input name="cpu" value={formData.cpu} onChange={handleChange} className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark rounded-xl px-5 py-4 outline-none" type="text" />
                      <ChangeAlert change={changes.cpu} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">OS</label>
                      <input name="os" value={formData.os} onChange={handleChange} className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark rounded-xl px-5 py-4 outline-none" type="text" />
                      <ChangeAlert change={changes.os} />
                    </div>

                    {/* --- RAM & PRICE --- */}
                    <div>
                      <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">RAM</label>
                      <input name="ram" value={formData.ram} onChange={handleChange} className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark rounded-xl px-5 py-4 outline-none" type="text" />
                      <ChangeAlert change={changes.ram} />
                      {/* Show Price Input Only if RAM Changed */}
                      {changes.ram && (
                        <PriceInput label="New RAM Price" name="pram" value={extraCosts.pram} onChange={handleCostChange} />
                      )}
                    </div>

                    {/* --- SSD & PRICE --- */}
                    <div>
                      <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">SSD</label>
                      <input name="ssd" value={formData.ssd} onChange={handleChange} className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark rounded-xl px-5 py-4 outline-none" type="text" />
                      <ChangeAlert change={changes.ssd} />
                      {/* Show Price Input Only if SSD Changed */}
                      {changes.ssd && (
                        <PriceInput label="New SSD Price" name="pssd" value={extraCosts.pssd} onChange={handleCostChange} />
                      )}
                    </div>

                    {/* --- HDD & PRICE --- */}
                    <div>
                      <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">HDD</label>
                      <input name="hdd" value={formData.hdd} onChange={handleChange} className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark rounded-xl px-5 py-4 outline-none" type="text" />
                      <ChangeAlert change={changes.hdd} />
                      {/* Show Price Input Only if HDD Changed */}
                      {changes.hdd && (
                        <PriceInput label="New HDD Price" name="phdd" value={extraCosts.phdd} onChange={handleCostChange} />
                      )}
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-4 space-y-8">
                
                {/* Media Assets Section */}
                <section className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
                  <div className="px-8 py-6 border-b border-slate-100 dark:border-border-dark flex items-center gap-4 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Icon name="add_photo_alternate" /></div>
                    <h2 className="text-xl font-extrabold">Media Assets</h2>
                  </div>
                  <div className="p-8">
                    <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">Upload New Images</label>
                    <div className="relative border-2 border-dashed border-slate-200 dark:border-border-dark rounded-2xl p-6 text-center hover:border-primary hover:bg-primary/[0.02] transition-all cursor-pointer group">
                      <input 
                        type="file" multiple accept="image/*" onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Icon name="upload_file" className="text-4xl text-slate-300 group-hover:text-primary mb-2 block mx-auto" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Click to upload files</p>
                    </div>

                    {(previewUrls.length > 0 || existingImages.length > 0) && (
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {existingImages.map((img, idx) => (
                          <div key={idx} className="aspect-square rounded-lg overflow-hidden relative border border-slate-200 dark:border-border-dark">
                            <img src={img.url} alt="Existing" className="w-full h-full object-cover opacity-60" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white text-[10px] font-bold">SAVED</div>
                          </div>
                        ))}
                        {previewUrls.map((url, idx) => (
                          <div key={idx} className="aspect-square rounded-lg overflow-hidden relative border border-primary/50 group">
                            <img src={url} alt="Preview" className="w-full h-full object-cover" />
                            <button onClick={() => removeNewFile(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Icon name="close" className="text-xs" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                {/* Status Section */}
                <section className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
                  <div className="px-8 py-6 border-b border-slate-100 dark:border-border-dark flex items-center gap-4 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Icon name="assignment_ind" /></div>
                    <h2 className="text-xl font-extrabold">Assignment & Status</h2>
                  </div>
                  <div className="p-8 space-y-6">
                    <div>
                      <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">Current Status</label>
                      <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark rounded-xl px-5 py-4 outline-none">
                        <option value="Assigned">Assigned</option>
                        <option value="Unassigned">Unassigned</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                      <ChangeAlert change={changes.status} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">Assigned Employee</label>
                      <input name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark rounded-xl px-5 py-4 outline-none" type="text" />
                      <ChangeAlert change={changes.assignedTo} />
                    </div>
                  </div>
                </section>

                {/* Additional Info Section - WITH REPAIR COST */}
                <section className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
                  <div className="px-8 py-6 border-b border-slate-100 dark:border-border-dark flex items-center gap-4 bg-slate-50/50 dark:bg-white/[0.02]">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Icon name="notes" /></div>
                    <h2 className="text-xl font-extrabold">Additional Information</h2>
                  </div>
                  <div className="p-8 space-y-4">
                    {/* NEW: Repair Cost Field */}
                    <div>
                       <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Repair / Service Cost</label>
                       <p className="text-xs text-slate-400 mb-2">If any general maintenance cost incurred during this update.</p>
                       <PriceInput label="Extra / Service Charge" name="pother" value={extraCosts.pother} onChange={handleCostChange} />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300 mt-4">Notes</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-dark rounded-xl px-5 py-4 min-h-[120px] outline-none" placeholder="Enter any additional remarks..." />
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* STEP 2 CONTENT (Review) */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 flex gap-6">
                <Icon name="fact_check" className="text-3xl text-primary" />
                <div>
                  <h3 className="text-2xl font-black">Final Review</h3>
                  <p className="text-slate-500">Verify changes before committing.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden p-8">
                  <h2 className="text-lg font-bold mb-4">Changes Summary</h2>
                  {hasChanges ? (
                    <div className="space-y-4">
                      {/* Image Change Notification */}
                      {selectedFiles.length > 0 && (
                        <div className="p-4 bg-slate-50 dark:bg-background-dark rounded-xl flex items-center gap-3">
                          <Icon name="image" className="text-primary" />
                          <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-white">New Images Added</p>
                            <p className="text-xs text-slate-500">{selectedFiles.length} file(s) ready for upload</p>
                          </div>
                        </div>
                      )}

                      {/* Text Field Changes */}
                      {Object.keys(changes).map(key => (
                        <div key={key} className="p-4 bg-slate-50 dark:bg-background-dark rounded-xl">
                          <p className="uppercase text-xs font-bold text-slate-400 mb-1">{key}</p>
                          <p className="font-bold text-primary">{changes[key].current}</p>
                          <p className="text-xs text-slate-500 line-through">Prev: {changes[key].original}</p>
                        </div>
                      ))}

                      {/* Cost Changes */}
                      {Object.values(extraCosts).some(v => v) && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl">
                          <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mb-2">Cost Updates Included</p>
                          <ul className="text-xs text-emerald-600 dark:text-emerald-500 list-disc ml-4">
                            {extraCosts.pram && <li>RAM Upgrade Cost: ${extraCosts.pram}</li>}
                            {extraCosts.pssd && <li>SSD Upgrade Cost: ${extraCosts.pssd}</li>}
                            {extraCosts.phdd && <li>HDD Cost: ${extraCosts.phdd}</li>}
                            {extraCosts.pother && <li>Service/Repair: ${extraCosts.pother}</li>}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : <p className="text-slate-500 italic">No changes detected.</p>}
                </div>
              </div>
            </div>
          )}
        </form>
      </main>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] p-6 bg-white/80 dark:bg-background-dark/80 backdrop-blur-2xl border-t border-slate-200 dark:border-border-dark shadow-2xl">
        <div className="w-full max-w-[1440px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {hasChanges ? (
              <div className="flex items-center gap-2 text-warning-amber">
                <Icon name="notification_important" />
                <span className="text-sm font-bold">
                  {Object.keys(changes).length + (selectedFiles.length > 0 ? 1 : 0) + (Object.values(extraCosts).some(v => v) ? 1 : 0)} changes detected
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400">
                <Icon name="check" />
                <span className="text-sm font-bold">No changes</span>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</button>
            {step === 2 && <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border font-bold">Back</button>}
            {step === 1 ? (
              <button onClick={() => setStep(2)} className="px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2">Next <Icon name="arrow_forward" /></button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={!hasChanges || submitting} 
                className="px-8 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Icon name="sync" className="animate-spin" /> : <Icon name="save_as" />}
                <span>Commit</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAsset;