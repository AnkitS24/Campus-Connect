import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
  MessageSquare,
  Briefcase,
  Bot,
  FileText,
  Calendar,
  BookOpen,
  Trophy,
  Users,
  ArrowRight,
  Bell,
  Coins,
  Clock,
  TrendingUp,
  Currency,
  CurlyBraces,
} from 'lucide-react';
import { placementAPI } from '../services/api';

const quickActions = [
  { to: '/chat', icon: MessageSquare, label: 'Community Chat', color: 'from-primary to-purple-500', desc: 'Join discussions' },
  { to: '/placements', icon: Briefcase, label: 'Placements', color: 'from-secondary to-cyan-500', desc: 'View opportunities' },
  { to: '/ai-mentor', icon: Bot, label: 'AI Mentor', color: 'from-accent to-orange-500', desc: 'Get guidance' },
  { to: '/resume-review', icon: FileText, label: 'Resume Review', color: 'from-pink-500 to-rose-500', desc: 'Optimize resume' },
  { to: '/mock-interviews', icon: Calendar, label: 'Mock Interviews', color: 'from-green-500 to-emerald-500', desc: 'Practice now' },
  { to: '/practice', icon: Trophy, label: 'Practice Problems', color: 'from-violet-500 to-purple-500', desc: 'Solve coding challenges' },
];
const now = new Date();

const Dashboard = () => {
  const { user } = useAuthStore();
  const [placements, setPlacements] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    placementAPI.getPlacements({ limit: 5, status: 'upcoming' })
      .then((res) => setPlacements(res.data.data?.placements || []))
      .catch(() => {});
  }, []);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.fullName?.split(' ')[0]}
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Here's what's happening on CampusConnect
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Bell, label: 'New Placements', value: placements.length, color: 'text-secondary' },
          { icon: Coins, label: 'Your Points', value: '8', color: 'text-primary' },
          { icon: TrendingUp, label: 'Your Rank', value: '#4', color: 'text-accent' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-surface-lighter ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="glass rounded-xl p-4 hover:glow-hover transition-all duration-300 group"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                <action.icon size={18} className="text-white" />
              </div>
              <p className="font-medium text-sm">{action.label}</p>
              <p className="text-xs text-text-muted">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upcoming Placements</h2>
            <Link to="/placements" className="text-sm text-primary hover:text-primary-light flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {placements.length === 0 ? (
              <p className="text-text-muted text-sm">No upcoming placements</p>
            ) : (
              placements.slice(0, 4).map((p) => { 
                const curr = new Date(now);
                curr.setHours(0,0,0,0);           
                
                const deadline = new Date(p.applicationDeadline);
                deadline.setHours(0,0,0,0);
                
                if(deadline >= curr){
                return (
                <div key={p._id} className="flex items-center justify-between p-3 rounded-lg bg-surface-lighter/50">
                  <div>
                    <p className="font-medium text-sm">{p.companyName}</p>
                    <p className="text-xs text-text-muted">{p.role}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Clock size={12} />
                    {new Date(p.applicationStart).toLocaleDateString()}
                  </div>
                </div>
                )}})
            )}
          </div>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {[
              { text: 'Welcome to CampusConnect! Complete your profile.', time: 'Just now' },
              { text: 'New placement drive announced by Google.', time: '2 hours ago' },
              { text: 'Your resume was reviewed by AI. Check feedback.', time: '1 day ago' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-surface-lighter/50">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                <div>
                  <p className="text-sm">{activity.text}</p>
                  <p className="text-xs text-text-muted mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
