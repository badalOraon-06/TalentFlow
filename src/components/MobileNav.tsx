import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, BarChart3, Building2, Users, ClipboardList, LogOut, User, Building } from 'lucide-react';
import { useAuth } from '../store/authStore';
import { SimpleNotificationBell } from './SimpleNotificationBell';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/login');
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'hr_manager': 'HR Manager',
      'recruiter': 'Recruiter',
      'hiring_manager': 'Hiring Manager',
      'candidate': 'Candidate'
    };
    return roleMap[role] || role;
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinks = [
    {
      to: '/dashboard',
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Dashboard',
      gradient: 'from-blue-600 to-indigo-600'
    },
    {
      to: '/jobs',
      icon: <Building2 className="h-5 w-5" />,
      label: 'Jobs',
      gradient: 'from-emerald-600 to-teal-600'
    },
    {
      to: '/candidates',
      icon: <Users className="h-5 w-5" />,
      label: 'Candidates',
      gradient: 'from-violet-600 to-purple-600'
    },
    {
      to: '/assessments',
      icon: <ClipboardList className="h-5 w-5" />,
      label: 'Assessments',
      gradient: 'from-orange-600 to-red-600'
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className={`lg:hidden p-2 rounded-lg transition-colors ${
          isOpen ? 'bg-gray-200' : 'hover:bg-gray-100'
        }`}
        aria-label="Toggle mobile menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-80 sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between border-b border-blue-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Building className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TalentFlow</span>
          </div>
          <button
            onClick={closeMenu}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto bg-white">
          {/* User Profile Section */}
          {user && (
            <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-br from-gray-50 to-blue-50 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-gray-900 truncate">
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {user.email}
                  </div>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getRoleDisplayName(user.role)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-2 bg-white">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                  isActivePath(link.to)
                    ? `bg-gradient-to-r ${link.gradient} text-white shadow-lg`
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className={isActivePath(link.to) ? 'text-white' : 'text-gray-500'}>
                  {link.icon}
                </div>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Notifications Section */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Notifications</span>
              <SimpleNotificationBell />
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 space-y-3 bg-white shadow-lg">
          <Link
            to="/profile"
            onClick={closeMenu}
            className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
          >
            <User className="h-5 w-5" />
            <span>View Profile</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-semibold transition-all shadow-lg"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
