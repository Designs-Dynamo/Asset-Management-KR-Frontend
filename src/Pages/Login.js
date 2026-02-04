import React,{useState} from 'react'
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/apiauth';

function Login() {
     const navigate = useNavigate();

  const [branchId, setbranchId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!branchId || !email || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (!email.endsWith(".com")) {
      setError("Please use a Gmail account");
      setLoading(false);
      return;
    }

    try {
      // 2. Call the API
      const data = await loginUser({ branchId, email, password });
      console.log(data);

      // 3. Save Auth Token (Critical for protected routes)
      localStorage.setItem('authToken', data.token); 
      localStorage.setItem('userRole', data.user.role); // Optional: Save role for UI logic

      // 4. Navigate based on Role returned by Backend
      if (localStorage.getItem('userRole') == 'ADMIN') {
        navigate("/admindashboard");
      } else {
         navigate(`/${data.user.branchId}/dashboard`);

      }

    } catch (err) {
      // 5. Handle API Errors
      setError(err); // Displays the error message thrown from api/auth.js
    } finally {
      setLoading(false);
    }
  };
  return (
    <>

      <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col relative overflow-hidden">
      {/* ===== Header ===== */}
      <header className="w-full flex items-center justify-between px-6 lg:px-12 py-6 relative z-10">
        <div className="flex items-center gap-3 text-primary">
          <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">
              account_tree
            </span>
          </div>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
            AssetTrack
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-500 dark:text-[#a2b2b4] text-xs font-medium uppercase tracking-widest hidden sm:block">
            Internal Access Only
          </span>
          <button className="flex items-center justify-center rounded-lg h-9 px-4 bg-slate-200 dark:bg-primary/20 text-slate-700 dark:text-white text-sm font-semibold hover:bg-slate-300 dark:hover:bg-primary/30 transition-colors">
            Support
          </button>
        </div>
      </header>

      {/* ===== Gradient Background ===== */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[55%] h-[55%] bg-primary/30 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[45%] h-[45%] bg-primary/20 rounded-full blur-[140px]" />
      </div>

      {/* ===== Main Content ===== */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-[440px] bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark shadow-2xl rounded-xl p-8">
          <h1 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight mb-2">
            System Login
          </h1>
          <p className="text-slate-500 dark:text-[#a2b2b4] text-sm mb-8">
            Access your branch assets and inventory management dashboard.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <input
              className="form-input w-full h-12 rounded-lg px-4 border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-[#121617] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50"
              placeholder="Branch Code"
              value={branchId}
              onChange={(e) => setbranchId(e.target.value)}
            />

            <input
              type="email"
              className="form-input w-full h-12 rounded-lg px-4 border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-[#121617] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="form-input w-full h-12 rounded-lg px-4 border border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-[#121617] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-error/10 border border-error/20 rounded-lg">
                <span className="material-symbols-outlined text-error text-sm">
                  error
                </span>
                <p className="text-error text-xs font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-primary text-white text-sm font-bold tracking-wide hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login to Portal"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-border-dark flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-slate-500 dark:text-[#a2b2b4] text-[11px] uppercase tracking-[0.1em]">
              Admin & IT Access Secured
            </span>
          </div>
        </div>
      </main>
    </div>

    </>
  )
}

export default Login
