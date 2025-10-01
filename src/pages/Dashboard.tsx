import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  ClipboardList,
  Target,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
  Activity,
  Award,
  FileText,
  Eye,
  Zap,
  Star,
  Heart
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
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/25',
    green: 'from-green-500 to-green-600 shadow-green-500/25',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/25',
    orange: 'from-orange-500 to-orange-600 shadow-orange-500/25',
    red: 'from-red-500 to-red-600 shadow-red-500/25',
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/25'
  };

  const changeColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div 
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              {icon}
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{value}</div>
          <div className="text-sm font-medium opacity-90">{title}</div>
          {change && (
            <div className={`text-xs mt-2 ${trend ? changeColors[trend] : 'text-white'} bg-white bg-opacity-20 rounded-full px-2 py-1 inline-block`}>
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
    blue: 'border-blue-400 hover:bg-blue-50 bg-blue-100 hover:bg-blue-200 text-blue-600',
    green: 'border-green-400 hover:bg-green-50 bg-green-100 hover:bg-green-200 text-green-600',
    purple: 'border-purple-400 hover:bg-purple-50 bg-purple-100 hover:bg-purple-200 text-purple-600'
  };

  return (
    <Link to={to}>
      <div className={`bg-white rounded-2xl border-2 border-gray-200 p-6 hover:${colorClasses[color as keyof typeof colorClasses].split(' ')[0]} hover:shadow-lg transition-all duration-300 group`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses].split(' ')[2]} rounded-xl flex items-center justify-center mb-4 group-hover:${colorClasses[color as keyof typeof colorClasses].split(' ')[3]} transition-colors`}>
              {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
    </Link>
  );
}

interface RecentActivityItem {
  id: string;
  type: 'job_created' | 'candidate_applied' | 'assessment_completed' | 'stage_changed';
  title: string;
  description: string;
  timestamp: Date;
  color: string;
}

function RecentActivityFeed({ activities }: { activities: RecentActivityItem[] }) {
  const getActivityStyles = (color: string) => {
    const styles = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-900 drop-shadow-lg font-bold stroke-2' },
      green: { bg: 'bg-green-100', text: 'text-green-900 drop-shadow-lg font-bold stroke-2' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-900 drop-shadow-lg font-bold stroke-2' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-900 drop-shadow-lg font-bold stroke-2' }
    };
    return styles[color as keyof typeof styles] || styles.blue;
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const styles = getActivityStyles(activity.color);
        return (
          <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className={`w-10 h-10 ${styles.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
              <Activity className={`h-5 w-5 ${styles.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
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

  // Mock recent activities (in a real app, this would come from an activity log)
  const recentActivities: RecentActivityItem[] = [
    {
      id: '1',
      type: 'job_created',
      title: 'New Job Posted',
      description: 'Senior React Developer position created',
      timestamp: new Date(),
      color: 'blue'
    },
    {
      id: '2',
      type: 'candidate_applied',
      title: 'New Application',
      description: 'Sarah Johnson applied for Frontend Developer role',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      color: 'green'
    },
    {
      id: '3',
      type: 'assessment_completed',
      title: 'Assessment Completed',
      description: 'Technical assessment for Backend Developer completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      color: 'purple'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded-xl w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-3xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <BarChart3 className="h-8 w-8 text-blue-700" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Welcome to TalentFlow</h1>
                  <p className="text-indigo-100 text-lg">Your hiring command center</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white text-sm opacity-90">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Jobs"
            value={totalJobs}
            change="+12% this month"
            trend="up"
            icon={<Building2 className="h-6 w-6 text-blue-600" />}
            color="blue"
            onClick={() => navigate('/jobs')}
          />
          <MetricCard
            title="Active Positions"
            value={activeJobs}
            change={`${Math.round((activeJobs / totalJobs) * 100)}% of total`}
            trend="neutral"
            icon={<Target className="h-6 w-6 text-green-600" />}
            color="green"
            onClick={() => navigate('/jobs')}
          />
          <MetricCard
            title="Total Candidates"
            value={totalCandidates}
            change="+25% this week"
            trend="up"
            icon={<Users className="h-6 w-6 text-purple-600" />}
            color="purple"
            onClick={() => navigate('/candidates')}
          />
          <MetricCard
            title="In Pipeline"
            value={activeCandidates}
            change={`${Math.round((activeCandidates / totalCandidates) * 100)}% active`}
            trend="up"
            icon={<TrendingUp className="h-6 w-6 text-orange-600" />}
            color="orange"
            onClick={() => navigate('/candidates')}
          />
        </div>

        {/* Pipeline Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Candidate Pipeline */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <TrendingUp className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Candidate Pipeline</h2>
                    <p className="text-green-100 text-sm">Current stage distribution</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { stage: 'applied', label: 'Applied', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', iconBg: 'bg-blue-100', hoverBg: 'hover:bg-blue-100', icon: <FileText className="h-5 w-5 text-blue-700 drop-shadow-sm" /> },
                  { stage: 'screen', label: 'Screening', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', iconBg: 'bg-yellow-100', hoverBg: 'hover:bg-yellow-100', icon: <Eye className="h-5 w-5 text-yellow-700 drop-shadow-sm" /> },
                  { stage: 'tech', label: 'Technical', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', iconBg: 'bg-purple-100', hoverBg: 'hover:bg-purple-100', icon: <ClipboardList className="h-5 w-5 text-purple-700 drop-shadow-sm" /> },
                  { stage: 'offer', label: 'Offer', bgColor: 'bg-green-50', borderColor: 'border-green-200', iconBg: 'bg-green-100', hoverBg: 'hover:bg-green-100', icon: <CheckCircle className="h-5 w-5 text-green-700 drop-shadow-sm" /> }
                ].map(({ stage, label, bgColor, borderColor, iconBg, hoverBg, icon }) => (
                  <div key={stage} className={`${bgColor} border-2 ${borderColor} rounded-xl p-4 text-center ${hoverBg} transition-colors cursor-pointer`}>
                    <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      {icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stageDistribution[stage] || 0}</div>
                    <div className="text-sm text-gray-600 font-medium">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Zap className="h-6 w-6 text-red-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Quick Actions</h2>
                  <p className="text-orange-100 text-sm">Get things done fast</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <QuickAction
                title="Post New Job"
                description="Create a new job posting"
                icon={<Plus className="h-6 w-6 text-blue-900" />}
                to="/jobs"
                color="blue"
              />
              <QuickAction
                title="Review Candidates"
                description="Check candidate applications"
                icon={<Users className="h-6 w-6 text-green-900" />}
                to="/candidates"
                color="green"
              />
              <QuickAction
                title="Create Assessment"
                description="Build new assessment"
                icon={<ClipboardList className="h-6 w-6 text-purple-900" />}
                to="/assessments"
                color="purple"
              />
            </div>
          </div>
        </div>

        {/* Recent Activity & Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Activity className="h-6 w-6 text-purple-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                    <p className="text-purple-100 text-sm">Latest platform updates</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <RecentActivityFeed activities={recentActivities} />
            </div>
          </div>

          {/* Hiring Statistics */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-green-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Award className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Hiring Performance</h2>
                  <p className="text-teal-100 text-sm">This month's highlights</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-8 w-8 text-green-700 drop-shadow-md" />
                  <div>
                    <div className="text-lg font-bold text-gray-900">5</div>
                    <div className="text-sm text-gray-600">Successful Hires</div>
                  </div>
                </div>
                <Star className="h-6 w-6 text-green-600 drop-shadow-sm" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3">
                  <Clock className="h-8 w-8 text-blue-700 drop-shadow-md" />
                  <div>
                    <div className="text-lg font-bold text-gray-900">12 days</div>
                    <div className="text-sm text-gray-600">Avg. Time to Hire</div>
                  </div>
                </div>
                <TrendingUp className="h-6 w-6 text-blue-600 drop-shadow-sm" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-3">
                  <Heart className="h-8 w-8 text-purple-700 drop-shadow-md" />
                  <div>
                    <div className="text-lg font-bold text-gray-900">95%</div>
                    <div className="text-sm text-gray-600">Candidate Satisfaction</div>
                  </div>
                </div>
                <Award className="h-6 w-6 text-purple-600 drop-shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}