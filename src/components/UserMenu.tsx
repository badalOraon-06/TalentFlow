import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Settings, 
  Shield, 
  ChevronDown, 
  UserCircle,
  Building2,
  Clock,
  Mail
} from 'lucide-react';
import { useAuth, useAuthPermissions } from '../store/authStore';

export function UserMenu() {
  const { user, logout } = useAuth();
  const { isAdmin, isHRManager } = useAuthPermissions();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      admin: 'System Administrator',
      hr_manager: 'HR Manager',
      recruiter: 'Recruiter',
      hiring_manager: 'Hiring Manager',
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const roleColors = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      hr_manager: 'bg-blue-100 text-blue-800 border-blue-200',
      recruiter: 'bg-green-100 text-green-800 border-green-200',
      hiring_manager: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Menu Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-medium text-sm">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          )}
        </div>
        
        {/* User Info */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900 truncate max-w-32">
            {user.name}
          </div>
          <div className="text-xs text-gray-500 truncate max-w-32">
            {getRoleDisplayName(user.role)}
          </div>
        </div>
        
        {/* Dropdown Arrow */}
        <ChevronDown 
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {user.name}
                </h3>
                <div className="flex items-center mt-1">
                  <Mail className="h-3 w-3 text-gray-400 mr-1" />
                  <p className="text-xs text-gray-600 truncate">{user.email}</p>
                </div>
                {user.department && (
                  <div className="flex items-center mt-1">
                    <Building2 className="h-3 w-3 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-600 truncate">{user.department}</p>
                  </div>
                )}
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Profile Link */}
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <UserCircle className="h-4 w-4 mr-3 text-gray-400" />
              <div>
                <div className="font-medium">My Profile</div>
                <div className="text-xs text-gray-500">View and edit your profile</div>
              </div>
            </Link>

            {/* Settings (Admin/HR only) */}
            {(isAdmin || isHRManager) && (
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">Settings</div>
                  <div className="text-xs text-gray-500">System preferences</div>
                </div>
              </Link>
            )}

            {/* Admin Panel (Admin only) */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="h-4 w-4 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">Admin Panel</div>
                  <div className="text-xs text-gray-500">Manage users and system</div>
                </div>
              </Link>
            )}

            {/* Activity Log */}
            <Link
              to="/activity"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Clock className="h-4 w-4 mr-3 text-gray-400" />
              <div>
                <div className="font-medium">Activity Log</div>
                <div className="text-xs text-gray-500">View your recent activity</div>
              </div>
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-2"></div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3 text-red-500" />
            <div className="text-left">
              <div className="font-medium">Sign out</div>
              <div className="text-xs text-red-500">Sign out of your account</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

// Compact version for mobile/smaller spaces
export function UserMenuCompact() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <span className="text-white font-medium text-sm">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
            <div className="text-xs text-gray-600 truncate">{user.email}</div>
          </div>
          
          <Link
            to="/profile"
            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}