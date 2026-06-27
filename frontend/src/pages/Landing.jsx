import { Link } from 'react-router-dom';
import { GraduationCap, Bot, Shield, Zap, MessageSquare, Briefcase, ArrowRight, Star } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-surface">
      <nav className="glass border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="text-primary" size={28} />
              <span className="text-xl font-bold gradient-text">CampusConnect</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm text-text-muted hover:text-text transition-colors">
                Sign In
              </Link>
              
              <Link
                to="/register"
                className="text-sm px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6">
            <Star size={14} />
            AI-Powered Placement Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Your Campus Journey,{' '}
            <span className="gradient-text">Supercharged with AI</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto mb-8">
            The all-in-one platform for placement preparation, peer collaboration,
            and career acceleration. Connect, learn, and land your dream job.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
            >
              Start Free
              <ArrowRight size={16} className="inline ml-2" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 rounded-xl glass-hover text-text font-medium transition-all duration-300"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything you need to succeed</h2>
          <p className="text-text-muted">Powerful features to accelerate your placement journey</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Bot, title: 'AI Resume Review', desc: 'Get instant ATS scoring and actionable suggestions to optimize your resume.' },
            { icon: MessageSquare, title: 'Group Chats', desc: 'Collaborate with peers in topic-specific groups with real-time messaging.' },
            { icon: Briefcase, title: 'Placement Tracking', desc: 'Never miss a deadline with real-time placement drive notifications.' },
            { icon: Zap, title: 'AI Mentor', desc: 'Get personalized guidance, roadmaps, and interview preparation tips.' },
            { icon: Shield, title: 'Mock Interviews', desc: 'Practice with peers and get feedback to ace your interviews.' },
            { icon: Star, title: 'Study Materials', desc: 'Access a vast library of study resources and practice questions.' },
          ].map((feature) => (
            <div key={feature.title} className="glass rounded-xl p-6 hover:glow-hover transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                <feature.icon size={22} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-text-muted text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-text-muted">
          <p>&copy; 2026 CampusConnect. Built for students.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
