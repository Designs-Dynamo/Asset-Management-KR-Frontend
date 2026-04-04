import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNav from '../admincomponents/AdminNav';
import Icon from '../components/Icon'; // Ensure you have this icon component

// --- Sub-Component: Section Header ---
const SectionHeader = ({ title, icon }) => (
  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-slate-200 dark:border-border-dark">
    <div className="p-2 bg-primary/10 text-primary rounded-lg">
      <Icon name={icon} className="text-xl" />
    </div>
    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
  </div>
);

// --- Sub-Component: Input Field ---
const InputField = ({ label, name, type = "text", value, onChange, placeholder, required = false, prefix }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{prefix}</span>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${prefix ? 'pl-8' : ''}`}
      />
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---
const CreateAsset = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // --- Form State ---
  const [formData, setFormData] = useState({
    // Core Identity
    assetCode: '',
    branchId: '',
    assetType: 'Laptop',
    assetCompany: '',
    purchaseDate: '',
    department: '',
    assignedTo: '',
    
    // Financials
    price: '',
    
    // Extra Costs (Nested Object)
    extraPram: '',
    extraPssd: '',
    extraPhdd: '',
    extraPother: '',

    // Hardware Details (Nested Object)
    deviceName: '',
    cpu: '',
    ram: '',
    ssd: '',
    hdd: '',
    os: '',
    status: 'Unassigned'
  });

  // Image State
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 5) {
      alert("You can only upload up to 5 images.");
      return;
    }
    setFiles(selectedFiles);
    
    // Generate previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      
      // 1. Construct FormData for File Upload
      const payload = new FormData();

      // Flat Fields
      payload.append("assetCode", formData.assetCode);
      payload.append("branchId", formData.branchId);
      payload.append("assetType", formData.assetType);
      payload.append("assetCompany", formData.assetCompany);
      payload.append("purchaseDate", formData.purchaseDate);
      payload.append("department", formData.department);
      payload.append("assignedTo", formData.assignedTo);
      payload.append("price", formData.price);

      // Nested Objects (Must be JSON stringified for FormData if controller expects JSON parsing)
      // NOTE: Your controller uses JSON.parse(Extraprice), so we must stringify.
      const extraPriceObj = {
        pram: formData.extraPram,
        pssd: formData.extraPssd,
        phdd: formData.extraPhdd,
        pother: formData.extraPother
      };
      payload.append("Extraprice", JSON.stringify(extraPriceObj));

      const deviceDetailsObj = {
        deviceName: formData.deviceName,
        cpu: formData.cpu,
        ram: formData.ram,
        ssd: formData.ssd,
        hdd: formData.hdd,
        os: formData.os,
        currentStatus: formData.status
      };
      payload.append("deviceDetails", JSON.stringify(deviceDetailsObj));

      // Images
      files.forEach((file) => {
        payload.append("images", file);
      });

      // 2. API Call
      await axios.post("http://localhost:5000/api/assets/", payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });

      // 3. Success Redirect
      alert("Asset Created Successfully!");
      navigate('/admindashboard'); // Or wherever you want to go

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create asset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display flex flex-col">
      <AdminNav />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Create New Asset</h1>
            <p className="text-slate-500 mt-1">Add a new device to the global inventory.</p>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="px-4 py-2 text-sm font-bold text-slate-500 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Core Identity Card */}
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm">
              <SectionHeader title="Identification & Location" icon="qr_code_2" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                  label="Asset Code (Unique ID)" 
                  name="assetCode" 
                  value={formData.assetCode} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. LPT-001" 
                />
                <InputField 
                  label="Branch ID" 
                  name="branchId" 
                  value={formData.branchId} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. BH001" 
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Asset Type *</label>
                  <select 
                    name="assetType" 
                    value={formData.assetType} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Printer">Printer</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Network">Network Gear</option>
                    <option value="Accessory">Accessory</option>
                  </select>
                </div>
                <InputField 
                  label="Manufacturer / Company" 
                  name="assetCompany" 
                  value={formData.assetCompany} 
                  onChange={handleChange} 
                  placeholder="e.g. Dell, HP, Apple" 
                />
              </div>
            </div>

            {/* 2. Hardware Specs Card */}
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm">
              <SectionHeader title="Hardware Specifications" icon="memory" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <InputField 
                    label="Device Name" 
                    name="deviceName" 
                    value={formData.deviceName} 
                    onChange={handleChange} 
                    placeholder="e.g. Latitude 5420" 
                  />
                </div>
                <InputField label="Processor (CPU)" name="cpu" value={formData.cpu} onChange={handleChange} placeholder="e.g. Intel i5 11th Gen" />
                <InputField label="RAM" name="ram" value={formData.ram} onChange={handleChange} placeholder="e.g. 16GB DDR4" />
                <InputField label="Primary Storage (SSD)" name="ssd" value={formData.ssd} onChange={handleChange} placeholder="e.g. 512GB NVMe" />
                <InputField label="Secondary Storage (HDD)" name="hdd" value={formData.hdd} onChange={handleChange} placeholder="e.g. 1TB SATA" />
                <InputField label="Operating System" name="os" value={formData.os} onChange={handleChange} placeholder="e.g. Windows 11 Pro" />
              </div>
            </div>

            {/* 3. Assignment & Status */}
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm">
              <SectionHeader title="Status & Assignment" icon="badge" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Unassigned">Unassigned (In Stock)</option>
                    <option value="Assigned">Assigned (In Use)</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <InputField 
                  label="Assigned Employee (ID/Name)" 
                  name="assignedTo" 
                  value={formData.assignedTo} 
                  onChange={handleChange} 
                  placeholder="Leave empty if Unassigned" 
                />
                <InputField 
                  label="Department" 
                  name="department" 
                  value={formData.department} 
                  onChange={handleChange} 
                  placeholder="e.g. Engineering" 
                />
                <InputField 
                  label="Purchase Date" 
                  name="purchaseDate" 
                  type="date"
                  value={formData.purchaseDate} 
                  onChange={handleChange} 
                />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - Financials & Media */}
          <div className="space-y-8">
            
            {/* 4. Financials Card */}
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm">
              <SectionHeader title="Financial Details" icon="attach_money" />
              <div className="space-y-4">
                <InputField 
                  label="Base Price" 
                  name="price" 
                  type="number" 
                  value={formData.price} 
                  onChange={handleChange} 
                  prefix="$" 
                  placeholder="0.00" 
                />
                
                <div className="pt-4 border-t border-slate-100 dark:border-border-dark">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-3">Extra Costs (Upgrades/Service)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="RAM Cost" name="extraPram" type="number" value={formData.extraPram} onChange={handleChange} prefix="$" />
                    <InputField label="SSD Cost" name="extraPssd" type="number" value={formData.extraPssd} onChange={handleChange} prefix="$" />
                    <InputField label="HDD Cost" name="extraPhdd" type="number" value={formData.extraPhdd} onChange={handleChange} prefix="$" />
                    <InputField label="Other/Service" name="extraPother" type="number" value={formData.extraPother} onChange={handleChange} prefix="$" />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Image Upload Card */}
            <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm">
              <SectionHeader title="Asset Images" icon="image" />
              
              {/* Dropzone */}
              <div className="relative border-2 border-dashed border-slate-200 dark:border-border-dark rounded-xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                  <Icon name="cloud_upload" className="text-4xl" />
                  <p className="text-xs font-bold uppercase tracking-wide">Drag & Drop or Click</p>
                </div>
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Icon name="close" className="text-xs block" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Action */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Icon name="sync" className="animate-spin" /> : <Icon name="add_circle" />}
              {loading ? "Creating Asset..." : "Create Asset"}
            </button>

          </div>

        </form>
      </main>
    </div>
  );
};

export default CreateAsset;