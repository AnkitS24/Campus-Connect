import { Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { GraduationCap } from 'lucide-react';

const AuthLayout = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <GraduationCap className="text-primary" size={32} />
              <h1 className="text-2xl font-bold gradient-text">CampusConnect</h1>
            </div>
            <p className="text-text-muted text-sm">
              AI-Powered Placement Collaboration Platform
            </p>
          </div>
          <Outlet />
        </div>
      </div>
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-secondary/10 to-surface items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h2 className="text-3xl font-bold mb-4 gradient-text">
            Empower Your Campus Journey
          </h2>
          <p className="text-text-muted mb-8">
            Connect, collaborate, and accelerate your career with AI-powered tools,
            real-time placement updates, and a community of achievers.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'AI Resume Review', desc: 'Get ATS scores & suggestions' },
              { label: 'Real-time Chat', desc: 'Collaborate with peers' },
              { label: 'Placement Alerts', desc: 'Never miss a deadline' },
              { label: 'Mock Interviews', desc: 'Practice with mentors' },
            ].map((item) => (
              <div key={item.label} className="glass rounded-lg p-3 text-left">
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
