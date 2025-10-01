import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { useAuth, useAuthPermissions, useIsAuthenticated } from '../store/authStore';
import type { UserRole, RolePermissions } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole;
  requiredPermission?: keyof RolePermissions;
  fallbackPath?: string;
  loadingComponent?: ReactNode;
  unauthorizedComponent?: ReactNode;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRole,
  requiredPermission,
  fallbackPath = '/login',
  loadingComponent,
  unauthorizedComponent,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { hasPermission, isRole } = useAuthPermissions();
  const location = useLocation();

  // Check session on mount
  useEffect(() => {
    // Session validation is handled by the auth store
  }, [requireAuth, isAuthenticated, user]);

  // Show loading state
  if (isLoading) {
    return loadingComponent || <DefaultLoadingComponent />;
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // Check role requirement
  if (requiredRole && !isRole(requiredRole)) {
    return unauthorizedComponent || (
      <DefaultUnauthorizedComponent 
        reason={`This page requires ${requiredRole} role`}
        userRole={user?.role}
      />
    );
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return unauthorizedComponent || (
      <DefaultUnauthorizedComponent 
        reason={`You don't have permission to access this page`}
        permission={requiredPermission}
      />
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}

// Default loading component
function DefaultLoadingComponent() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Verifying access...</h2>
        <p className="text-gray-600">Please wait while we check your permissions</p>
      </div>
    </div>
  );
}

// Default unauthorized component
function DefaultUnauthorizedComponent({ 
  reason, 
  userRole, 
  permission 
}: { 
  reason: string; 
  userRole?: string; 
  permission?: string; 
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          
          <p className="text-gray-600 mb-6">{reason}</p>
          
          {userRole && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Current role: <strong>{userRole}</strong></span>
              </div>
              {permission && (
                <div className="mt-2 text-xs text-gray-500">
                  Required permission: <strong>{permission}</strong>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Higher-order component for role-based routes
export function withRoleProtection(
  Component: React.ComponentType<any>,
  requiredRole: UserRole,
  requiredPermission?: keyof RolePermissions
) {
  return function ProtectedComponent(props: any) {
    return (
      <ProtectedRoute 
        requiredRole={requiredRole} 
        requiredPermission={requiredPermission}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Specific role-based route components
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
}

// Permission-based route components
export function CanManageUsersRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredPermission="canManageUsers">
      {children}
    </ProtectedRoute>
  );
}

export function CanCreateJobsRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredPermission="canCreateJobs">
      {children}
    </ProtectedRoute>
  );
}

export function CanManageCandidatesRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredPermission="canManageCandidates">
      {children}
    </ProtectedRoute>
  );
}

// Public route component (for login/signup pages)
export function PublicRoute({ 
  children, 
  redirectIfAuthenticated = true,
  redirectTo = '/'
}: { 
  children: ReactNode; 
  redirectIfAuthenticated?: boolean;
  redirectTo?: string;
}) {
  const isAuthenticated = useIsAuthenticated();

  if (redirectIfAuthenticated && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
