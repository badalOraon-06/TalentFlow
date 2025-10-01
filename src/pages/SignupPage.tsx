import { useEffect } from 'react';
import { SignupForm } from '../components/SignupForm';
import { PublicRoute } from '../components/ProtectedRoute';

export function SignupPage() {
  // Set page title
  useEffect(() => {
    document.title = 'Sign Up - TalentFlow';
  }, []);

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-md p-8">
            <SignupForm />
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}