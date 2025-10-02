import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser, AuthState, LoginCredentials, SignupData, UserRole, RolePermissions } from '../types';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  
  // Utility methods
  hasPermission: (permission: keyof RolePermissions) => boolean;
  isRole: (role: UserRole) => boolean;
  checkSession: () => boolean;
}

// Role-based permissions mapping
const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    canManageUsers: true,
    canCreateJobs: true,
    canEditJobs: true,
    canDeleteJobs: true,
    canManageCandidates: true,
    canViewAllCandidates: true,
    canCreateAssessments: true,
    canViewReports: true,
    canAccessAdminPanel: true,
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionExpiry: null,

      // Login action
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('🔐 Attempting login for:', credentials.email);
          
          // Make API call to login endpoint
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          console.log('📡 Login response status:', response.status, response.statusText);

          // Check if response has content before trying to parse JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.error('❌ Response is not JSON:', contentType);
            throw new Error(`Server returned ${response.status}: ${response.statusText}. MSW may not be running.`);
          }

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }

          // Use session expiry from API response or calculate fallback
          const sessionExpiry = data.data?.sessionExpiry 
            ? new Date(data.data.sessionExpiry)
            : (() => {
                const expiry = new Date();
                expiry.setHours(expiry.getHours() + (credentials.rememberMe ? 24 * 7 : 8));
                return expiry;
              })();

          set({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            sessionExpiry,
          });

          console.log('✅ Login successful for:', data.data.user.name);
        } catch (error) {
          console.error('❌ Login failed:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
            user: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Signup action
      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('📝 Attempting signup for:', data.email);
          
          // Validate passwords match
          if (data.password !== data.confirmPassword) {
            throw new Error('Passwords do not match');
          }

          // Make API call to signup endpoint
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: data.name,
              email: data.email,
              password: data.password,
              role: data.role,
              department: data.department,
            }),
          });

          console.log('📡 Signup response status:', response.status, response.statusText);

          // Check if response has content before trying to parse JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.error('❌ Response is not JSON:', contentType);
            throw new Error(`Server returned ${response.status}: ${response.statusText}. MSW may not be running.`);
          }

          const responseData = await response.json();

          if (!response.ok) {
            throw new Error(responseData.message || 'Signup failed');
          }

          // Auto-login after successful signup
          const sessionExpiry = responseData.data?.sessionExpiry 
            ? new Date(responseData.data.sessionExpiry)
            : (() => {
                const expiry = new Date();
                expiry.setHours(expiry.getHours() + 8);
                return expiry;
              })();

          set({
            user: responseData.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            sessionExpiry,
          });

          console.log('✅ Signup successful for:', responseData.data.user.name);
        } catch (error) {
          console.error('❌ Signup failed:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Signup failed',
            user: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Logout action
      logout: () => {
        console.log('👋 Logging out user');
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          sessionExpiry: null,
        });
        
        // Clear any additional auth-related data
        localStorage.removeItem('authToken');
      },

      // Refresh authentication (check if session is still valid)
      refreshAuth: async () => {
        const { user, checkSession } = get();
        
        if (!user || !checkSession()) {
          get().logout();
          return;
        }

        set({ isLoading: true });

        try {
          // Make API call to validate current session
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Session invalid');
          }

          const data = await response.json();
          
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('❌ Session refresh failed:', error);
          get().logout();
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Update user profile
      updateProfile: async (profileData: Partial<AuthUser>) => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Profile update failed');
          }

          set({
            user: { ...user, ...data.user },
            isLoading: false,
            error: null,
          });

          console.log('✅ Profile updated successfully');
        } catch (error) {
          console.error('❌ Profile update failed:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Profile update failed',
          });
          throw error;
        }
      },

      // Check if user has specific permission
      hasPermission: (permission: keyof RolePermissions): boolean => {
        const { user } = get();
        if (!user) return false;
        
        const permissions = rolePermissions[user.role];
        return permissions[permission];
      },

      // Check if user has specific role
      isRole: (role: UserRole): boolean => {
        const { user } = get();
        return user?.role === role;
      },

      // Check if session is still valid
      checkSession: (): boolean => {
        const { sessionExpiry } = get();
        if (!sessionExpiry) return false;
        
        return new Date() < new Date(sessionExpiry);
      },
    }),
    {
      name: 'talentflow-auth', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry,
      }),
      // Rehydrate auth state on app load
      onRehydrateStorage: () => (state) => {
        if (state && !state.checkSession()) {
          state.logout();
        }
      },
    }
  )
);

// Utility hook for checking permissions
export const useAuthPermissions = () => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const isRole = useAuthStore((state) => state.isRole);
  const user = useAuthStore((state) => state.user);
  
  return {
    hasPermission,
    isRole,
    user,
    isAdmin: isRole('admin'),
  };
};

// Export auth store selectors for common use cases
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const signup = useAuthStore((state) => state.signup);
  const logout = useAuthStore((state) => state.logout);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
  };
};

// Minimal auth hooks for specific use cases
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  logout: state.logout,
  signup: state.signup,
  clearError: state.clearError,
}));
