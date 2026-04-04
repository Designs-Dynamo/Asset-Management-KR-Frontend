import React, { useState } from 'react';
import axios from 'axios';
import AdminNav from '../admincomponents/AdminNav';
import Icon from '../components/Icon'; 

const InputField = ({ label, name, type = "text", value, onChange, placeholder, required = false, icon }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
        <Icon name={icon} className="text-xl" />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-slate-900 dark:text-white"
      />
    </div>
  </div>
);

const CreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Updated Form State with regionId
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BRANCH_USER', 
    branchId: '',
    regionId: '' // Added for Region Managers
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      await axios.post("http://localhost:5000/api/auth/register", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("User Created Successfully!");
      setFormData({ name: '', email: '', password: '', role: 'BRANCH_USER', branchId: '', regionId: '' });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display flex flex-col">
      <AdminNav />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight mb-2">Create Personnel</h1>
            <p className="text-slate-500">Register Admins, Regional Managers, or Branch Staff.</p>
          </div>

          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-8 shadow-xl">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                <Icon name="error" />
                <span className="text-sm font-bold">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                  label="Full Name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required icon="badge" 
                  placeholder="John Doe"
                />
                
                {/* Dynamic Field: Shows Branch ID for Users, Region ID for Region Managers, Hidden for Admins */}
                {formData.role === 'BRANCH_USER' && (
                  <InputField 
                    label="Branch ID" 
                    name="branchId" 
                    value={formData.branchId} 
                    onChange={handleChange} 
                    required icon="store" 
                    placeholder="BH-01"
                  />
                )}
                {formData.role === 'REGION_MANAGER' && (
                  <InputField 
                    label="Region ID" 
                    name="regionId" 
                    value={formData.regionId} 
                    onChange={handleChange} 
                    required icon="map" 
                    placeholder="REG-NORTH"
                  />
                )}
                {formData.role === 'ADMIN' && (
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-[10px] font-black uppercase text-slate-400">
                    Admin: No Branch/Region Required
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                  label="Email Address" 
                  name="email" 
                  type="email"
                  value={formData.email} 
                  onChange={handleChange} 
                  required icon="mail" 
                  placeholder="john@company.com"
                />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Role *</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                      <Icon name="verified_user" className="text-xl" />
                    </div>
                    <select 
                      name="role" 
                      value={formData.role} 
                      onChange={handleChange} 
                      className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 rounded-xl pl-12 pr-10 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none cursor-pointer"
                    >
                      <option value="BRANCH_USER">Branch User</option>
                      <option value="REGION_MANAGER">Region Manager</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                    <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <InputField 
                label="Password" 
                name="password" 
                type="password"
                value={formData.password} 
                onChange={handleChange} 
                required icon="lock" 
                placeholder="••••••••"
              />

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-black shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Icon name="sync" className="animate-spin" /> : <Icon name="person_add" />}
                {loading ? "Creating..." : "Create Account"}
              </button>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateUser;