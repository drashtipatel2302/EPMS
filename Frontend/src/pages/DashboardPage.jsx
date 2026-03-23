import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const roleBadgeColor = {
  SUPER_ADMIN: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  HR: 'text-green-400 bg-green-400/10 border-green-400/20',
  MANAGER: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  EMPLOYEE: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 grid-bg flex items-center justify-center relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-600/15 rounded-full blur-[80px] animate-float animation-delay-300" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-4">
        {/* Card */}
        <div
          className="rounded-3xl bg-slate-900/95 backdrop-blur-xl p-10 text-center"
          style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.1)' }}
        >
          {/* Avatar */}
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl mx-auto flex items-center justify-center mb-6">
            <span className="font-display font-bold text-3xl text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>

          <h1 className="font-display font-bold text-3xl text-white mb-2">
            Welcome, {user?.name}!
          </h1>

          <div className="flex items-center justify-center gap-2 mb-6">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
                roleBadgeColor[user?.role] || 'text-slate-400 bg-slate-400/10 border-slate-400/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
              {user?.role}
            </span>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            {user?.department && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/40">
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">Department</p>
                <p className="text-white font-body font-medium">{user.department}</p>
              </div>
            )}
            {user?.designation && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/40">
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">Designation</p>
                <p className="text-white font-body font-medium">{user.designation}</p>
              </div>
            )}
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-8">
            <p className="text-indigo-300 text-sm font-body">
              🎉 Login successful! Your dashboard is being built. More features coming soon.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 mx-auto text-slate-400 hover:text-white text-sm font-body transition-colors duration-200 group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
