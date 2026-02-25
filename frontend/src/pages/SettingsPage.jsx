import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Settings, CheckCircle2, AlertCircle, Monitor, Bell, Database,
  Trash2, ToggleLeft, ToggleRight, Clock, BookOpen, MessageSquare,
  Brain, CheckCheck, Sparkles, ArrowRight, Shield, Palette, Volume2,
  FileText, User
} from 'lucide-react';

// Simulated session data (in a real app this would come from an API)
function getStoredSessions() {
  try {
    const raw = localStorage.getItem('biomentor_sessions');
    if (raw) return JSON.parse(raw);
  } catch {}
  // Default demo sessions
  return [
    { id: 1, type: 'chat', title: 'DNA Replication Discussion', timestamp: Date.now() - 3600000, status: 'pending' },
    { id: 2, type: 'quiz', title: 'Protein Synthesis Quiz', timestamp: Date.now() - 7200000, status: 'pending' },
    { id: 3, type: 'chat', title: 'CRISPR Gene Editing Overview', timestamp: Date.now() - 86400000, status: 'pending' },
    { id: 4, type: 'study', title: 'Cell Biology Study Session', timestamp: Date.now() - 172800000, status: 'pending' },
    { id: 5, type: 'quiz', title: 'Molecular Biology Assessment', timestamp: Date.now() - 259200000, status: 'accepted' },
    { id: 6, type: 'chat', title: 'Biotechnology Applications', timestamp: Date.now() - 345600000, status: 'accepted' },
  ];
}

function saveStoredSessions(sessions) {
  localStorage.setItem('biomentor_sessions', JSON.stringify(sessions));
}

function getPreferences() {
  try {
    const raw = localStorage.getItem('biomentor_prefs');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    theme: 'dark',
    notifications: true,
    soundEffects: true,
    autoSave: true,
    compactMode: false,
  };
}

function savePreferences(prefs) {
  localStorage.setItem('biomentor_prefs', JSON.stringify(prefs));
}

const sessionIcons = {
  chat: MessageSquare,
  quiz: Brain,
  study: BookOpen,
};

const sessionColors = {
  chat: 'text-accent-teal',
  quiz: 'text-accent-violet',
  study: 'text-accent-amber',
};

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [prefs, setPrefs] = useState(getPreferences());
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setSessions(getStoredSessions());
  }, []);

  useEffect(() => { savePreferences(prefs); }, [prefs]);

  const flash = (msg) => { setSuccess(msg); setError(''); setTimeout(() => setSuccess(''), 3000); };

  // Session management
  const acceptSession = useCallback((id) => {
    setSessions(prev => {
      const next = prev.map(s => s.id === id ? { ...s, status: 'accepted' } : s);
      saveStoredSessions(next);
      return next;
    });
  }, []);

  const acceptAllSessions = useCallback(() => {
    setSessions(prev => {
      const next = prev.map(s => ({ ...s, status: 'accepted' }));
      saveStoredSessions(next);
      return next;
    });
    flash('All sessions accepted!');
  }, []);

  const removeSession = useCallback((id) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      saveStoredSessions(next);
      return next;
    });
  }, []);

  const clearAllSessions = useCallback(() => {
    if (window.confirm('Clear all session history?')) {
      setSessions([]);
      saveStoredSessions([]);
      flash('Session history cleared');
    }
  }, []);

  // Preferences
  const togglePref = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const clearLocalData = () => {
    if (window.confirm('This will clear all local preferences and cached data. Continue?')) {
      localStorage.removeItem('biomentor_prefs');
      localStorage.removeItem('biomentor_sessions');
      setSessions([]);
      setPrefs({ theme: 'dark', notifications: true, soundEffects: true, autoSave: true, compactMode: false });
      flash('Local data cleared');
    }
  };

  const pendingCount = sessions.filter(s => s.status === 'pending').length;

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-4 lg:p-8 animate-fade-in text-center mt-20">
        <div className="w-16 h-16 bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Settings className="w-8 h-8 text-surface-500" />
        </div>
        <h2 className="text-xl font-display font-bold text-white mb-2">Sign In Required</h2>
        <p className="text-surface-400 text-sm mb-6">Please sign in to access settings.</p>
        <button onClick={() => navigate('/auth')} className="btn-primary inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Sign In <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-8 animate-blur-in">
      {/* Header */}
      <div className="mb-8 animate-slide-up-spring" style={{ animationDelay: '0.05s' }}>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3 neon-text">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-indigo/20 to-accent-violet/20 rounded-xl flex items-center justify-center gradient-border-animated">
            <Settings className="w-5 h-5 text-accent-indigo" />
          </div>
          Settings
        </h1>
        <p className="text-sm text-surface-400 mt-2 ml-[52px]">Manage sessions, preferences, and data</p>
        <div className="glow-line mt-4 w-24 ml-[52px]" />
      </div>

      {/* Feedback */}
      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-xl text-emerald-400 text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/15 rounded-xl text-red-400 text-sm flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* ─── Session Management ─── */}
      <div className="glass-card hover-tilt glass-card-shine p-6 mb-4 corner-accents">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent-teal" />
            Session Management
            {pendingCount > 0 && (
              <span className="ml-1.5 px-2 py-0.5 text-[10px] font-bold bg-brand-500/15 text-brand-400 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </h2>
          <div className="flex gap-2">
            {pendingCount > 0 && (
              <button
                onClick={acceptAllSessions}
                className="btn-primary sparkle-hover text-xs py-1.5 px-4 flex items-center gap-1.5 shadow-glow-sm"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Accept All
              </button>
            )}
            {sessions.length > 0 && (
              <button onClick={clearAllSessions} className="btn-ghost text-xs flex items-center gap-1.5 text-surface-400 hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-surface-600 mx-auto mb-2" />
            <p className="text-sm text-surface-500">No sessions yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
            {sessions.map(session => {
              const Icon = sessionIcons[session.type] || FileText;
              const colorClass = sessionColors[session.type] || 'text-surface-400';
              const isPending = session.status === 'pending';

              return (
                <div
                  key={session.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isPending
                      ? 'bg-surface-800/60 border-white/[0.06] hover:border-white/[0.08]'
                      : 'bg-surface-800/30 border-white/[0.03] opacity-70'
                  }`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${colorClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-200 truncate">{session.title}</p>
                    <p className="text-[11px] text-surface-500">
                      {new Date(session.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {' · '}
                      <span className="capitalize">{session.type}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isPending ? (
                      <button onClick={() => acceptSession(session.id)} className="text-xs text-brand-400 hover:text-brand-300 border border-brand-500/20 hover:border-brand-500/40 px-3 py-1 rounded-lg transition-all hover:bg-brand-500/5">
                        Accept
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400/70 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Accepted
                      </span>
                    )}
                    <button onClick={() => removeSession(session.id)} className="p-1 text-surface-500 hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Preferences ─── */}
      <div className="glass-card hover-tilt glass-card-shine p-6 mb-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-accent-amber" /> Preferences
        </h2>

        <div className="space-y-3">
          {[
            { key: 'notifications', label: 'Notifications', desc: 'Receive quiz reminders and study alerts', icon: Bell },
            { key: 'soundEffects', label: 'Sound Effects', desc: 'Play sounds for quiz answers and alerts', icon: Volume2 },
            { key: 'autoSave', label: 'Auto-Save Progress', desc: 'Automatically save learning progress', icon: Database },
            { key: 'compactMode', label: 'Compact Mode', desc: 'Reduce spacing for a denser UI', icon: Monitor },
          ].map(({ key, label, desc, icon: Icon }) => (
            <button
              key={key}
              onClick={() => togglePref(key)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-800/40 border border-white/[0.04] hover:border-white/[0.06] transition-all text-left"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.04] flex-shrink-0">
                <Icon className="w-4 h-4 text-surface-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-200">{label}</p>
                <p className="text-[11px] text-surface-500">{desc}</p>
              </div>
              {prefs[key] ? (
                <ToggleRight className="w-6 h-6 text-brand-400 flex-shrink-0" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-surface-600 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Data Management ─── */}
      <div className="glass-card hover-tilt glass-card-shine p-6">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-accent-rose" /> Data Management
        </h2>
        <p className="text-xs text-surface-400 mb-4">Manage locally cached data. Your server-side data (profile, quizzes, chat history) can be managed from your Profile page.</p>
        <div className="flex gap-3">
          <button onClick={clearLocalData} className="text-xs text-surface-300 hover:text-white border border-white/[0.06] hover:border-white/[0.08] px-4 py-2 rounded-xl transition-all hover:bg-white/[0.04]">
            Clear Local Data
          </button>
          <button onClick={() => navigate('/profile')} className="text-xs text-brand-400 hover:text-brand-300 border border-brand-500/20 hover:border-brand-500/40 px-4 py-2 rounded-xl transition-all hover:bg-brand-500/5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Go to Profile
          </button>
        </div>
      </div>
    </div>
  );
}
