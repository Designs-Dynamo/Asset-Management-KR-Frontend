import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Points to your local backend. Added /api/auth to match your routes
      const { data } = await axios.post("https://kr-asset-backend-git-forgot-a6ba5e-jay-patels-projects-5e30b249.vercel.app/api/auth/forgot-password", { email });
      
      setStatus({ 
        type: 'success', 
        message: data.message || 'Recovery link dispatched to your inbox.' 
      });
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Verification failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#131313] text-[#e5e2e1] font-sans min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Atmosphere Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#2ddbde]/5 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#2ddbde]/10 blur-[120px]"></div>

      <main className="relative z-10 w-full max-w-md px-6">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 mb-6 rounded-xl flex items-center justify-center bg-[#353534]">
            <span className="material-symbols-outlined text-[#2ddbde] text-4xl">lock_reset</span>
          </div>
          <h1 className="font-bold text-3xl tracking-tight text-[#e5e2e1] mb-2">AssetCentral</h1>
          <p className="text-[#bbc8d0] text-sm uppercase tracking-wider">System Recovery Portal</p>
        </div>

        {/* Recovery Card */}
        <div className="bg-[#353532]/70 backdrop-blur-[20px] p-8 rounded-xl border border-[#3e4949]/20 shadow-2xl">
          <header className="mb-6">
            <h2 className="text-xl font-bold text-[#e5e2e1]">Forgot Password?</h2>
            <p className="text-[#bdc9c8] text-sm mt-2 leading-relaxed">
              Enter your registered email address and we'll send you a secure link to reset your account credentials.
            </p>
          </header>

          {status.type === 'success' ? (
            <div className="text-center py-4">
              <div className="bg-green-500/10 text-green-400 border border-green-500/20 p-4 rounded-lg mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined">check_circle</span>
                <p className="text-sm font-medium">{status.message}</p>
              </div>
              <Link to="/login" className="text-[#2ddbde] hover:underline text-sm font-bold">
                Return to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#bbc8d0]" htmlFor="email">
                  Work Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#879392] text-lg">mail</span>
                  <input
                    className="w-full bg-[#353534] border border-transparent focus:border-[#2ddbde]/40 focus:ring-4 focus:ring-[#2ddbde]/10 rounded-lg py-3.5 pl-12 pr-4 text-[#e5e2e1] placeholder:text-[#879392] transition-all outline-none"
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {status.type === 'error' && (
                <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-lg text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {status.message}
                </div>
              )}

              <button
                disabled={loading}
                className="w-full py-4 rounded-lg font-bold text-[#003738] transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(45deg, #2ddbde 0%, #008082 100%)' }}
                type="submit"
              >
                {loading ? "Processing..." : "Send Reset Link"}
                {!loading && <span className="material-symbols-outlined text-xl">arrow_forward</span>}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-[#3e4949]/10 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#bbc8d0] hover:text-[#2ddbde] transition-colors group">
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">chevron_left</span>
              Back to Secure Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-[10px] text-[#879392]/50 tracking-widest uppercase">
            © 2026 AssetCentral Internal Systems
          </p>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;