import { useEffect } from 'react';
import { LoginForm } from '../components/LoginForm';
import { PublicRoute } from '../components/ProtectedRoute';

export function LoginPage() {
  // Set page title
  useEffect(() => {
    document.title = 'Sign In - TalentFlow';
  }, []);

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-md p-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}