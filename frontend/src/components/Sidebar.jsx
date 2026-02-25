import { NavLink } from 'react-router-dom';
import { Home, MessageSquare, Brain, BarChart3, Route, X, Dna, BookOpen, Sparkles, FileText, UserCircle, Settings, TrendingUp, GitBranch, AlertOctagon, Timer, Map, Star } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/chat', label: 'AI Tutor', icon: MessageSquare },
  { path: '/quiz', label: 'Quiz', icon: Brain },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/learning-path', label: 'Learning Path', icon: Route },
  { path: '/report', label: 'Summary', icon: FileText },
  { path: '/library', label: 'Library', icon: BookOpen },
];

const toolItems = [
  { path: '/exam-predictor', label: 'Exam Predictor', icon: TrendingUp },
  { path: '/diagram', label: 'Diagram Creator', icon: GitBranch },
  { path: '/mistakes', label: 'Mistake Analyzer', icon: AlertOctagon },
  { path: '/revision', label: '5-Min Revision', icon: Timer },
  { path: '/roadmap', label: 'Study Roadmap', icon: Map },
];

const accountItems = [
  { path: '/profile', label: 'Profile', icon: UserCircle },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[272px] bg-surface-900/80 backdrop-blur-2xl border-r border-white/[0.06] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header with logo */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.06] relative">
            {/* Glow line at bottom of header */}
            <div className="absolute bottom-0 left-4 right-4 glow-line" />
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-gradient-to-br from-brand-400/20 to-brand-600/20 rounded-xl flex items-center justify-center shadow-glow-sm glow-breathe gradient-border-animated">
                <div className="absolute inset-0 bg-brand-500/10 rounded-xl blur-sm" />
                <Dna className="relative w-5 h-5 text-brand-400 animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-sm font-display font-bold text-white leading-tight tracking-tight neon-text">BioMentor AI</h1>
                <p className="text-[10px] text-brand-400/60 font-medium tracking-wider uppercase">Biotech Tutor</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors">
              <X className="w-4 h-4 text-surface-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="text-[10px] font-bold text-brand-400/50 uppercase tracking-[0.15em] px-3 mb-3">Navigation</p>
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-400 shadow-glow-sm'
                      : 'text-surface-400 hover:text-white hover:bg-white/[0.04]'
                  }`
                }
                end={path === '/'}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.06] transition-all duration-200 group-hover:scale-110">
                  <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                </div>
                {label}
              </NavLink>
            ))}

            <div className="my-3 border-t border-white/[0.06]" />
            <p className="text-[10px] font-bold text-brand-400/50 uppercase tracking-[0.15em] px-3 mb-3">AI Tools</p>
            {toolItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-400 shadow-glow-sm'
                      : 'text-surface-400 hover:text-white hover:bg-white/[0.04]'
                  }`
                }
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.06] transition-all duration-200 group-hover:scale-110">
                  <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                </div>
                {label}
              </NavLink>
            ))}

            <div className="my-3 border-t border-white/[0.06]" />
            <p className="text-[10px] font-bold text-brand-400/50 uppercase tracking-[0.15em] px-3 mb-3">Account</p>
            {accountItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-400 shadow-glow-sm'
                      : 'text-surface-400 hover:text-white hover:bg-white/[0.04]'
                  }`
                }
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.06] transition-all duration-200 group-hover:scale-110">
                  <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                </div>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/[0.06] relative">
            {/* Glow line at top of footer */}
            <div className="absolute top-0 left-4 right-4 glow-line" />
            <div className="glass-card glass-card-shine p-4 relative overflow-hidden glow-breathe corner-accents">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl morph-blob" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-sky-500/5 rounded-full blur-xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-glow-pulse" />
                  <span className="text-[11px] font-bold text-brand-300 tracking-wide">RAG-Powered</span>
                  <Star className="w-3 h-3 text-brand-500/40 ml-auto" />
                </div>
                <p className="text-[11px] text-surface-400 leading-relaxed">
                  6 topics &bull; 25+ subtopics &bull; Curriculum-aligned AI responses
                </p>
                {/* Mini progress dots */}
                <div className="flex gap-1 mt-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-400/30 animate-glow-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
