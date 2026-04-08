import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState('');
    
    // Toggle for password visibility
    const [showPass, setShowPass] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setError("Passwords do not match. Please ensure both fields are identical.");
            return;
        }



        setLoading(true);
        try {
            const { data } = await axios.put(`https://kr-asset-backend-git-forgot-a6ba5e-jay-patels-projects-5e30b249.vercel.app/api/auth/reset-password/${token}`, { password });
            
            localStorage.setItem('authToken', data.token); // Updated key to match your Login logic
            setShowSuccess(true);
            
            // Redirect after a short delay so they can see the success toast
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Link expired or invalid session.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#131313] text-[#e5e2e1] font-sans min-h-screen flex flex-col relative overflow-hidden">
            {/* Decorative Ambient Background Elements */}
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#008082] opacity-10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#a96039] opacity-5 rounded-full blur-[120px]"></div>

            <main className="flex-grow flex items-center justify-center px-6 py-12 z-10">
                <div className="w-full max-w-md">
                    {/* Branding/Identity */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#353534] mb-6 shadow-2xl">
                            <span className="material-symbols-outlined text-[#2ddbde] text-4xl">lock_reset</span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-[#e5e2e1] mb-2">AssetCentral</h1>
                        <p className="text-[#bbc8d0] text-sm font-medium tracking-wide uppercase">Internal Security Systems</p>
                    </div>

                    {/* Main Security Card */}
                    <div className="bg-[#353534]/70 backdrop-blur-[20px] border border-[#3e4949]/20 rounded-xl p-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)]">
                        <div className="mb-8">
                            <h2 className="text-xl text-[#e5e2e1] font-bold">Update Password</h2>
                            <p className="text-[#bdc9c8] text-sm mt-1">Choose a strong password with at least 12 characters.</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleReset}>
                            {/* New Password */}
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold uppercase tracking-widest text-[#bbc8d0] ml-1" htmlFor="new-password">
                                    New Password
                                </label>
                                <div className="relative group">
                                    <input 
                                        className="w-full bg-[#353534] border-none rounded-lg px-4 py-3 text-[#e5e2e1] placeholder-[#879392] focus:ring-1 focus:ring-[#2ddbde]/40 transition-all border-b-2 border-[#2ddbde]/20 outline-none" 
                                        id="new-password" 
                                        placeholder="••••••••••••" 
                                        type={showPass ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <span 
                                        className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#3e4949] cursor-pointer hover:text-[#2ddbde] transition-colors"
                                        onClick={() => setShowPass(!showPass)}
                                    >
                                        {showPass ? 'visibility_off' : 'visibility'}
                                    </span>
                                </div>
                                
                                {/* Dynamic Strength Indicator (Visual only for now) */}
                                <div className="flex gap-1 mt-2">
                                    <div className={`h-1 flex-1 rounded-full ${password.length > 0 ? 'bg-[#2ddbde]' : 'bg-[#353534]'}`}></div>
                                    <div className={`h-1 flex-1 rounded-full ${password.length > 5 ? 'bg-[#2ddbde]' : 'bg-[#353534]'}`}></div>
                                    <div className={`h-1 flex-1 rounded-full ${password.length > 8 ? 'bg-[#2ddbde]' : 'bg-[#353534]'}`}></div>
                                    <div className={`h-1 flex-1 rounded-full ${password.length > 11 ? 'bg-[#2ddbde]' : 'bg-[#353534]'}`}></div>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold uppercase tracking-widest text-[#bbc8d0] ml-1" htmlFor="confirm-password">
                                    Confirm Password
                                </label>
                                <div className="relative group">
                                    <input 
                                        className="w-full bg-[#353534] border-none rounded-lg px-4 py-3 text-[#e5e2e1] placeholder-[#879392] focus:ring-1 focus:ring-[#2ddbde]/40 transition-all outline-none" 
                                        id="confirm-password" 
                                        placeholder="••••••••••••" 
                                        type={showPass ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Error State */}
                            {error && (
                                <div className="p-3 bg-[#93000a]/20 border-l-2 border-[#ffb4ab] rounded flex items-start gap-3">
                                    <span className="material-symbols-outlined text-[#ffb4ab] text-xl">error</span>
                                    <p className="text-xs text-[#ffdad6] leading-tight">{error}</p>
                                </div>
                            )}

                            {/* Action Button */}
                            <button 
                                className="w-full bg-gradient-to-r from-[#2ddbde] to-[#008082] text-[#003738] font-bold py-4 rounded-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50" 
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Update Password"}
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-[#3e4949]/10 flex justify-center">
                            <Link to="/forgot-password" className="text-xs text-[#bbc8d0] hover:text-[#2ddbde] transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">keyboard_backspace</span>
                                Back to Secure Login
                            </Link>
                        </div>
                    </div>

                    {/* Success State Toast */}
                    {showSuccess && (
                        <div className="mt-6 flex items-center justify-between p-4 bg-[#201f1f] border border-[#2ddbde]/20 rounded-xl shadow-2xl animate-bounce">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#2ddbde]/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#2ddbde] text-sm">check</span>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-sm font-bold text-[#e5e2e1]">Security Profile Updated</p>
                                    <p className="text-[10px] text-[#bdc9c8]">Redirecting to system access...</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="w-full py-8 px-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0e0e0e] border-t border-[#3e4949]/10">
                <p className="text-xs text-[#879392]">© 2026 AssetCentral Internal Systems. All rights reserved.</p>
                <div className="flex gap-6">
                    <span className="text-xs text-[#879392] hover:text-[#2ddbde] transition-colors cursor-pointer">Privacy Policy</span>
                    <span className="text-xs text-[#879392] hover:text-[#2ddbde] transition-colors cursor-pointer">IT Support</span>
                </div>
            </footer>
        </div>
    );
};

export default ResetPassword;