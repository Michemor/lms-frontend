import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/authhook';
import { FiLogOut } from 'react-icons/fi';

/**
 * Reusable Navbar component for pages
 * Matches the Dashboard header styling and structure
 * @param {string} title - Page title to display
 * @param {string} subtitle - Optional subtitle/description
 */
export const Navbar = ({ title = 'Page', subtitle = '' }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <header className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>}
      </div>
      <button 
        onClick={handleLogout}
        className="bg-slate-900 hover:bg-black text-white px-4 md:px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 active:scale-95 text-sm md:text-base"
        title="Logout"
      >
        <FiLogOut className="text-lg md:text-xl" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  );
}
