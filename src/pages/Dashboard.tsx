import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  ClipboardList,
  Target,
  CheckCircle,
  Plus,
  ArrowRight,
  Activity,
  FileText,
  Eye,
  Zap
} from 'lucide-react';
import { useJobs, useCandidates } from '../hooks/useApiDirect';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
  onClick?: () => void;
}

function MetricCard({ title, value, change, trend, icon, color, onClick }: MetricCardProps) {
  const colorClasses = {
    blue: 'from-blue-600 via-blue-700 to-blue-800 shadow-blue-500/30',
    green: 'from-emerald-600 via-emerald-700 to-emerald-800 shadow-emerald-500/30',
    purple: 'from-violet-600 via-violet-700 to-violet-800 shadow-violet-500/30',
    orange: 'from-amber-600 via-orange-700 to-orange-800 shadow-amber-500/30',
    red: 'from-rose-600 via-rose-700 to-rose-800 shadow-rose-500/30',
    indigo: 'from-indigo-600 via-indigo-700 to-indigo-800 shadow-indigo-500/30'
  };

  const changeColors = {
    up: 'text-emerald-100 bg-emerald-500/20',
    down: 'text-rose-100 bg-rose-500/20',
    neutral: 'text-blue-100 bg-blue-500/20'
  };

  return (
    <div 
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] ${onClick ? 'cursor-pointer' : ''} border border-white/10 backdrop-blur-sm`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between h-full">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/15 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              {icon}
            </div>
            {trend && (
              <div className={`text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium ${changeColors[trend]} border border-white/20`}>
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
              </div>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 tracking-tight">{value}</div>
          <div className="text-xs sm:text-sm font-medium text-white/90 mb-1 sm:mb-2">{title}</div>
          {change && (
            <div className="text-xs text-white/75 font-medium">
              {change}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  color: string;
}

function QuickAction({ title, description, icon, to, color }: QuickActionProps) {
  const colorClasses = {
    blue: 'hover:border-blue-500/50 hover:bg-blue-50/50 bg-blue-50/30 text-blue-700 hover:text-blue-800',
    green: 'hover:border-emerald-500/50 hover:bg-emerald-50/50 bg-emerald-50/30 text-emerald-700 hover:text-emerald-800',
    purple: 'hover:border-violet-500/50 hover:bg-violet-50/50 bg-violet-50/30 text-violet-700 hover:text-violet-800'
  };

  return (
    <Link to={to}>
      <div className={`bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 p-4 sm:p-5 md:p-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500 group hover:-translate-y-1 ${colorClasses[color as keyof typeof colorClasses]}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg border border-gray-200/50 group-hover:scale-110 transition-transform duration-300">
              <div className="text-current">{icon}</div>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-current transition-colors">{title}</h3>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{description}</p>
          </div>
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
    </Link>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Data hooks
  const { data: jobsData, loading: jobsLoading } = useJobs({ page: 1, pageSize: 100 });
  const { data: candidatesData, loading: candidatesLoading } = useCandidates({ 
    page: 1, 
    pageSize: 1000, 
    search: '',
    stage: ''
  });

  useEffect(() => {
    if (!jobsLoading && !candidatesLoading) {
      setIsLoading(false);
    }
  }, [jobsLoading, candidatesLoading]);

  // Calculate metrics
  const totalJobs = jobsData?.jobs?.length || 0;
  const activeJobs = jobsData?.jobs?.filter(job => job.status === 'active').length || 0;
  const totalCandidates = candidatesData?.candidates?.length || 0;
  const activeCandidates = candidatesData?.candidates?.filter(candidate => 
    ['applied', 'screen', 'tech', 'offer'].includes(candidate.stage)
  ).length || 0;

  // Stage distribution
  const stageDistribution = candidatesData?.candidates?.reduce((acc, candidate) => {
    acc[candidate.stage] = (acc[candidate.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4 sm:space-y-6 md:space-y-8">
            <div className="h-10 sm:h-12 bg-gray-200 rounded-xl w-48 sm:w-64"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 sm:h-32 bg-gray-200 rounded-2xl sm:rounded-3xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        {/* Professional Welcome Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20"></div>
            <div className="hidden sm:block absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6 flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-xl flex-shrink-0">
                  <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 tracking-tight">TalentFlow Dashboard</h1>
                  <p className="text-blue-100 text-xs sm:text-sm md:text-base lg:text-lg font-medium hidden sm:block">Your comprehensive hiring command center</p>
                  <div className="flex items-center space-x-2 sm:space-x-4 mt-1 sm:mt-2 md:mt-3">
                    <div className="flex items-center space-x-1 sm:space-x-2 text-blue-200 text-xs sm:text-sm">
                      <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Real-time insights</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right hidden md:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20">
                  <div className="text-white text-xs sm:text-sm font-medium mb-1">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long'
                    })}
                  </div>
                  <div className="text-blue-100 text-base sm:text-lg font-bold">
                    {new Date().toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <MetricCard
            title="Total Jobs"
            value={totalJobs}
            change="+12% this month"
            trend="up"
            icon={<Building2 className="h-6 w-6" />}
            color="blue"
            onClick={() => navigate('/jobs')}
          />
          <MetricCard
            title="Active Positions"
            value={activeJobs}
            change={`${Math.round((activeJobs / totalJobs) * 100)}% of total`}
            trend="neutral"
            icon={<Target className="h-6 w-6" />}
            color="green"
            onClick={() => navigate('/jobs')}
          />
          <MetricCard
            title="Total Candidates"
            value={totalCandidates}
            change="+25% this week"
            trend="up"
            icon={<Users className="h-6 w-6" />}
            color="purple"
            onClick={() => navigate('/candidates')}
          />
          <MetricCard
            title="In Pipeline"
            value={activeCandidates}
            change={`${Math.round((activeCandidates / totalCandidates) * 100)}% active`}
            trend="up"
            icon={<TrendingUp className="h-6 w-6" />}
            color="orange"
            onClick={() => navigate('/candidates')}
          />
        </div>

        {/* Professional Pipeline Overview */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Enhanced Candidate Pipeline */}
          <div className="xl:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 flex-shrink-0">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">Candidate Pipeline</h2>
                    <p className="text-emerald-100 text-xs sm:text-sm font-medium hidden sm:block">Real-time stage distribution</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 border border-white/20 flex-shrink-0">
                  <div className="text-white font-bold text-base sm:text-lg">{totalCandidates}</div>
                  <div className="text-emerald-100 text-xs">Total</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 md:p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {[
                  { stage: 'applied', label: 'Applied', bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100', borderColor: 'border-blue-300/50', iconBg: 'bg-blue-500', hoverBg: 'hover:from-blue-100 hover:to-blue-200', icon: <FileText className="h-5 w-5 text-white" />, color: 'text-blue-700' },
                  { stage: 'screen', label: 'Screening', bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100', borderColor: 'border-amber-300/50', iconBg: 'bg-amber-500', hoverBg: 'hover:from-amber-100 hover:to-amber-200', icon: <Eye className="h-5 w-5 text-white" />, color: 'text-amber-700' },
                  { stage: 'tech', label: 'Technical', bgColor: 'bg-gradient-to-br from-violet-50 to-violet-100', borderColor: 'border-violet-300/50', iconBg: 'bg-violet-500', hoverBg: 'hover:from-violet-100 hover:to-violet-200', icon: <ClipboardList className="h-5 w-5 text-white" />, color: 'text-violet-700' },
                  { stage: 'offer', label: 'Offer', bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100', borderColor: 'border-emerald-300/50', iconBg: 'bg-emerald-500', hoverBg: 'hover:from-emerald-100 hover:to-emerald-200', icon: <CheckCircle className="h-5 w-5 text-white" />, color: 'text-emerald-700' }
                ].map(({ stage, label, bgColor, borderColor, iconBg, hoverBg, icon, color }) => (
                  <div key={stage} className={`${bgColor} border-2 ${borderColor} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-center ${hoverBg} transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1`}>
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 ${iconBg} rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg`}>
                      {icon}
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stageDistribution[stage] || 0}</div>
                    <div className={`text-xs sm:text-sm font-semibold ${color}`}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Quick Actions */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20"></div>
              <div className="relative flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 flex-shrink-0">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">Quick Actions</h2>
                  <p className="text-orange-100 text-xs sm:text-sm font-medium hidden sm:block">Streamline your workflow</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4 md:space-y-6">
              <QuickAction
                title="Post New Job"
                description="Create a new job posting"
                icon={<Plus className="h-6 w-6" />}
                to="/jobs"
                color="blue"
              />
              <QuickAction
                title="Review Candidates"
                description="Check candidate applications"
                icon={<Users className="h-6 w-6" />}
                to="/candidates"
                color="green"
              />
              <QuickAction
                title="Create Assessment"
                description="Build new assessment"
                icon={<ClipboardList className="h-6 w-6" />}
                to="/assessments"
                color="purple"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}