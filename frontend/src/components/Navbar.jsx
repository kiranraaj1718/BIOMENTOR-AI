import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Dna, User, LogOut, Sparkles } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Home';
      case '/chat': return 'AI Tutor Chat';
      case '/quiz': return 'Adaptive Quiz';
      case '/dashboard': return 'Analytics Dashboard';
      case '/learning-path': return 'Learning Path';
      case '/report': return 'Summary';
      case '/library': return 'Study Library';
      case '/profile': return 'Profile';
      case '/settings': return 'Settings';
      case '/exam-predictor': return 'Exam Predictor';
      case '/diagram': return 'Diagram Creator';
      case '/mistakes': return 'Mistake Analyzer';
      case '/revision': return '5-Minute Revision';
      case '/roadmap': return 'Study Roadmap';
      default: return 'BioMentor AI';
    }
  };

  return (
    <header className="relative h-16 bg-surface-900/60 backdrop-blur-2xl border-b border-white/[0.06] flex items-center justify-between px-5 lg:px-8 z-30 shadow-inner-glow">
      {/* Decorative glow line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 glow-line" />
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-white/[0.06] rounded-xl transition-colors">
          <Menu className="w-5 h-5 text-surface-300" />
        </button>
        <div className="flex items-center gap-3">
          <div className="relative glow-breathe rounded-lg">
            <div className="absolute inset-0 bg-brand-500/20 rounded-lg blur-md" />
            <Dna className="relative w-6 h-6 text-brand-400 animate-spin-slow" />
          </div>
          <span className="text-lg font-display font-bold text-white hidden sm:block tracking-tight neon-text">BioMentor AI</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 ml-1">
          <div className="w-px h-5 bg-gradient-to-b from-transparent via-brand-500/30 to-transparent" />
          <span className="text-sm text-surface-400 font-medium">{getPageTitle()}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-2.5">
            <Link to="/profile" className="group flex items-center gap-2.5 px-3.5 py-2 glass-card glass-card-shine rounded-xl hover:border-white/[0.12] transition-all">
              <div className="w-7 h-7 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center shadow-md shadow-brand-500/20 transition-transform duration-200 group-hover:scale-110">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-medium text-surface-200 group-hover:text-white transition-colors">{user?.username || 'Student'}</span>
            </Link>
            <button
              onClick={logout}
              className="p-2 hover:bg-red-500/10 rounded-xl transition-all text-surface-400 hover:text-red-400 hover:rotate-12 duration-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link to="/auth" className="btn-primary sparkle-hover text-sm py-2 px-5 flex items-center gap-2 group">
            <Sparkles className="w-3.5 h-3.5 group-hover:animate-wiggle" />
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
