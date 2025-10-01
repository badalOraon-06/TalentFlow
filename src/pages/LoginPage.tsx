import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, ClipboardList, BarChart3, ArrowRight } from 'lucide-react';
import { LoginForm } from '../components/LoginForm';
import { PublicRoute } from '../components/ProtectedRoute';

export function LoginPage() {
  // Set page title
  useEffect(() => {
    document.title = 'Sign In - TalentFlow';
  }, []);

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex min-h-screen">
          {/* Left Side - Branding and Features */}
          <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 xl:px-12">
            <div className="max-w-md mx-auto w-full">
              {/* Logo and Brand */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">TalentFlow</h1>
                <p className="text-xl text-gray-600">
                  Streamline your hiring process with intelligent candidate management
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Candidate Management
                    </h3>
                    <p className="text-gray-600">
                      Organize and track candidates through every stage of your hiring pipeline
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Smart Assessments
                    </h3>
                    <p className="text-gray-600">
                      Create custom assessments and evaluate candidates efficiently
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Analytics & Insights
                    </h3>
                    <p className="text-gray-600">
                      Get detailed insights into your hiring process and team performance
                    </p>
                  </div>
                </div>
              </div>

              {/* Testimonial */}
              <div className="mt-12 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">JD</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Jane Doe</div>
                    <div className="text-sm text-gray-600">HR Director, TechCorp</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "TalentFlow has revolutionized our hiring process. We've reduced time-to-hire by 40% 
                  and improved candidate quality significantly."
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="max-w-md w-full mx-auto">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="ml-3 text-2xl font-bold text-gray-900">TalentFlow</h1>
                </div>
              </div>

              {/* Login Form */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <LoginForm />
              </div>

              {/* Footer Links */}
              <div className="mt-8 text-center">
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                  <Link 
                    to="/help" 
                    className="hover:text-blue-600 transition-colors flex items-center"
                  >
                    Need help?
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                  <span>•</span>
                  <Link 
                    to="/contact" 
                    className="hover:text-blue-600 transition-colors"
                  >
                    Contact support
                  </Link>
                  <span>•</span>
                  <Link 
                    to="/privacy" 
                    className="hover:text-blue-600 transition-colors"
                  >
                    Privacy policy
                  </Link>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  © 2025 TalentFlow. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </PublicRoute>
  );
}