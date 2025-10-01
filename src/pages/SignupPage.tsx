import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Shield, Users, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { SignupForm } from '../components/SignupForm';
import { PublicRoute } from '../components/ProtectedRoute';

export function SignupPage() {
  // Set page title
  useEffect(() => {
    document.title = 'Sign Up - TalentFlow';
  }, []);

  const benefits = [
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and security for all your hiring data',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Seamless collaboration between HR, recruiters, and hiring managers',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance to handle thousands of candidates effortlessly',
    },
  ];

  const features = [
    'Unlimited candidate profiles',
    'Advanced search and filtering',
    'Custom assessment builder',
    'Real-time collaboration',
    'Analytics and reporting',
    '24/7 customer support',
  ];

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="flex min-h-screen">
          {/* Left Side - Signup Form */}
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

              {/* Signup Form */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <SignupForm />
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
                    to="/terms" 
                    className="hover:text-blue-600 transition-colors"
                  >
                    Terms of service
                  </Link>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  © 2025 TalentFlow. All rights reserved.
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Branding and Benefits */}
          <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 xl:px-12">
            <div className="max-w-md mx-auto w-full">
              {/* Logo and Brand */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Join TalentFlow</h1>
                <p className="text-xl text-gray-600">
                  Transform your hiring process and build amazing teams
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-6 mb-12">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Features Checklist */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  What you get with TalentFlow
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="mt-8 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg">
                  <Zap className="h-4 w-4 mr-2" />
                  Start your free trial today
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  No credit card required • 14-day free trial
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </PublicRoute>
  );
}