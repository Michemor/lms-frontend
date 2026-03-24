import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SideBar from './SideBar';
import { useAuth } from '../hooks/authhook';
import { GiHamburgerMenu } from 'react-icons/gi';

/**
 * ProtectedLayout Component
 * Provides consistent sidebar + content layout for all authenticated user pages
 * @param {React.ReactNode} children - The page content to display
 * @param {string} title - Page title/greeting
 * @param {string} subtitle - Optional page subtitle
 * @param {React.ReactNode} action - Optional action button/element (top right)
 */
export default function ProtectedLayout({ children, title, subtitle, action }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Component */}
      <SideBar 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onNavigate={(path) => navigate(path)}
        onLogout={handleLogout}
        currentPath={location.pathname}
        branding="LeaveSystem"
      />

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 w-full">
        {/* Header */}
        {title && (
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu Button - Mobile Only */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-2xl text-slate-900 hover:text-slate-700 transition"
              >
                <GiHamburgerMenu />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
                {subtitle && <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>}
              </div>
            </div>
            {action && (
              <div>
                {typeof action === 'object' && action?.label ? (
                  <button
                    onClick={action.onClick}
                    className="px-4 py-2 bg-slate-900 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                  >
                    {action.label}
                  </button>
                ) : (
                  action
                )}
              </div>
            )}
          </header>
        )}

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}
