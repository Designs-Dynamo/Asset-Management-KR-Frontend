import React, { useState } from 'react';
import axios from 'axios';
import AdminNav from '../admincomponents/AdminNav';
import Icon from '../components/Icon'; 

// --- Sub-Component: Input Field ---
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
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BRANCH_USER', // Default
    branchId: ''
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
      
      // Make sure this matches your backend URL structure
      await axios.post("https://asset-management-and-tracking-syste.vercel.app/api/auth/register", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("User Created Successfully!");
      // Reset form or navigate away
      setFormData({ name: '', email: '', password: '', role: 'BRANCH_USER', branchId: '' });
      // navigate('/admin/users'); // Uncomment if you have a user list page

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create user. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display flex flex-col">
      <AdminNav />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight mb-2">Create New User</h1>
            <p className="text-slate-500">Add a Branch Manager or Administrator to the system.</p>
          </div>

          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                <Icon name="error" />
                <span className="text-sm font-bold">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Row 1: Name & Branch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                  label="Full Name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  icon="badge" 
                  placeholder="e.g. John Doe"
                />
                <InputField 
                  label="Branch ID" 
                  name="branchId" 
                  value={formData.branchId} 
                  onChange={handleChange} 
                  required 
                  icon="store" 
                  placeholder="e.g. BH001"
                />
              </div>

              {/* Row 2: Email & Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                  label="Email Address" 
                  name="email" 
                  type="email"
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  icon="mail" 
                  placeholder="john@company.com"
                />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Role <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                      <Icon name="admin_panel_settings" className="text-xl" />
                    </div>
                    <select 
                      name="role" 
                      value={formData.role} 
                      onChange={handleChange} 
                      className="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-border-dark rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none cursor-pointer"
                    >
                      <option value="BRANCH_USER">Branch User</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                    <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 3: Password */}
              <div className="pt-2">
                <InputField 
                  label="Password" 
                  name="password" 
                  type="password"
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  icon="lock" 
                  placeholder="••••••••"
                />
                <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                  <Icon name="info" className="text-xs" /> 
                  Must be at least 6 characters long.
                </p>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 mt-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {loading ? <Icon name="sync" className="animate-spin" /> : <Icon name="person_add" />}
                {loading ? "Creating User..." : "Create User Account"}
              </button>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateUser;