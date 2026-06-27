import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
  LayoutDashboard,
  MessageSquare,
  Bell,
  Bot,
  FileText,
  Calendar,
  Briefcase,
  Trophy,
  Users,
  GraduationCap,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  User,
  Code2,
  Share2,
  ShieldUser
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/chat', icon: MessageSquare, label: 'Community Chat' },
  { to: '/placements', icon: Briefcase, label: 'Placements' },
  { to: '/ai-mentor', icon: Bot, label: 'AI Mentor' },
  { to: '/resume-review', icon: FileText, label: 'Resume Review' },
  { to: '/mock-interviews', icon: Calendar, label: 'Mock Interviews' },
  { to: '/experiences', icon: Users, label: 'Experiences' },
  { to: '/contests', icon: Code2, label: 'Contests' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' }
];

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          border-r border-border bg-surface/95 backdrop-blur-xl
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
            <GraduationCap className="text-primary shrink-0" size={28} />
            <span className="font-bold text-lg gradient-text">CampusConnect</span>
          </div>

          <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
            {navItems.map((item) => (
              
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-text-muted hover:text-text hover:bg-surface-lighter'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}

            {user?.role !== "student" && <NavLink
                key={'/admin'}
                to={'/admin'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-text-muted hover:text-text hover:bg-surface-lighter'
                  }`
                }
              >
                <ShieldUser size={20} />
                {'Admin'}
              </NavLink> }
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {user?.fullName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName}</p>
                <p className="text-xs text-text-muted capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-text-muted hover:text-error hover:bg-error/10 transition-all duration-200"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 glass border-b border-border px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-lighter transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="hidden lg:flex items-center gap-2 text-sm text-text-muted">
              <GraduationCap size={16} />
              <span>{user?.branch} • Year {user?.year}</span>
            </div>

            <div className="flex items-center gap-3">
              <NavLink
                to="/profile"
                className="p-2 rounded-lg hover:bg-surface-lighter transition-colors"
              >
                <User size={18} className="text-text-muted" />
              </NavLink>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
