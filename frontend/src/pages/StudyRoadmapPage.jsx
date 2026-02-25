import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { featuresAPI } from '../api/client';
import {
  Map, Sparkles, ArrowRight, Loader2, Calendar, Target, CheckCircle2,
  ChevronDown, ChevronUp, Clock, BookOpen, Brain, Play, RotateCcw,
  Lightbulb, Zap, Flag
} from 'lucide-react';

const GOALS = [
  { value: 'exam_ready', label: 'Exam Ready', desc: 'comprehensive preparation for exams', icon: Target },
  { value: 'deep_understanding', label: 'Deep Understanding', desc: 'thorough concept mastery', icon: Brain },
  { value: 'quick_overview', label: 'Quick Overview', desc: 'fast overview of all topics', icon: Zap },
];

const taskTypeColors = {
  study: 'text-accent-teal bg-accent-teal/10',
  quiz: 'text-accent-violet bg-accent-violet/10',
  revision: 'text-accent-amber bg-accent-amber/10',
  practice: 'text-accent-sky bg-accent-sky/10',
};

export default function StudyRoadmapPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [goal, setGoal] = useState('exam_ready');
  const [weeks, setWeeks] = useState(4);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [expandedWeek, setExpandedWeek] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await featuresAPI.generateRoadmap({ goal, weeks });
      setResult(res.data);
      setExpandedWeek(0);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-4 lg:p-8 animate-fade-in text-center mt-20">
        <div className="w-16 h-16 bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Map className="w-8 h-8 text-surface-500" />
        </div>
        <h2 className="text-xl font-display font-bold text-white mb-2">Sign In Required</h2>
        <p className="text-surface-400 text-sm mb-6">Sign in to create your study roadmap.</p>
        <button onClick={() => navigate('/auth')} className="btn-primary inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Sign In <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 lg:p-8 animate-blur-in">
      {/* Header */}
      <div className="mb-8 animate-slide-up-spring" style={{ animationDelay: '0.05s' }}>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3 neon-text">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-indigo/20 to-violet-500/20 rounded-xl flex items-center justify-center gradient-border-animated">
            <Map className="w-5 h-5 text-accent-indigo" />
          </div>
          Personalized Study Roadmap
        </h1>
        <p className="text-sm text-surface-400 mt-2 ml-[52px]">AI-generated multi-week study plan tailored to your progress</p>
        <div className="glow-line mt-4 w-24 ml-[52px]" />
      </div>

      {/* Setup */}
      {!result && (
        <div className="glass-card hover-tilt glass-card-shine p-6 space-y-5">
          {/* Goal */}
          <div>
            <label className="block text-xs font-semibold text-surface-400 mb-2 uppercase tracking-wider">Study Goal</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 stagger-children">
              {GOALS.map(g => {
                const Icon = g.icon;
                return (
                  <button key={g.value} onClick={() => setGoal(g.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${goal === g.value ? 'border-brand-500/40 bg-brand-500/10' : 'border-white/[0.06] bg-surface-800/40 hover:border-white/[0.1]'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${goal === g.value ? 'text-brand-400' : 'text-surface-400'}`} />
                      <p className={`text-xs font-semibold ${goal === g.value ? 'text-brand-400' : 'text-surface-200'}`}>{g.label}</p>
                    </div>
                    <p className="text-[10px] text-surface-500">{g.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weeks */}
          <div>
            <label className="block text-xs font-semibold text-surface-400 mb-2 uppercase tracking-wider">Duration (weeks)</label>
            <div className="flex gap-2">
              {[2, 4, 6, 8].map(w => (
                <button key={w} onClick={() => setWeeks(w)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${weeks === w ? 'border-brand-500/40 bg-brand-500/10 text-brand-400' : 'border-white/[0.06] text-surface-400 hover:border-white/[0.1]'}`}>
                  {w}w
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button onClick={generate} disabled={loading} className="btn-primary sparkle-hover w-full flex items-center justify-center gap-2 py-3">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating roadmap...</> : <><Map className="w-4 h-4" /> Generate Roadmap</>}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Summary */}
          <div className="glass-card glow-breathe p-5 corner-accents">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-indigo/10 flex items-center justify-center flex-shrink-0">
                <Map className="w-5 h-5 text-accent-indigo" />
              </div>
              <div>
                <p className="text-sm text-surface-300 leading-relaxed">{result.roadmap_summary}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-surface-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {result.total_weeks} weeks</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~{result.weekly_hours_recommended}h/week</span>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones Timeline */}
          {result.milestones?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-accent-amber" /> Milestones
              </h3>
              <div className="relative pl-6">
                <div className="absolute left-2 top-1 bottom-1 w-px bg-surface-700" />
                {result.milestones.map((m, i) => (
                  <div key={i} className="relative mb-3 last:mb-0">
                    <div className={`absolute -left-4 w-4 h-4 rounded-full border-2 ${m.achieved ? 'bg-emerald-500/20 border-emerald-500' : 'bg-surface-800 border-surface-600'}`}>
                      {m.achieved && <CheckCircle2 className="w-3 h-3 text-emerald-400 absolute top-0 left-0" />}
                    </div>
                    <div className="ml-2">
                      <p className="text-xs text-surface-500">Week {m.week}</p>
                      <p className={`text-sm ${m.achieved ? 'text-emerald-400' : 'text-surface-300'}`}>{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Plans */}
          {result.weeks?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent-teal" /> Weekly Plans
              </h3>
              {result.weeks.map((week, wi) => {
                const isOpen = expandedWeek === wi;
                return (
                  <div key={wi} className="glass-card overflow-hidden">
                    <button onClick={() => setExpandedWeek(isOpen ? null : wi)} className="w-full flex items-center gap-3 p-4 text-left">
                      <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-brand-400">W{week.week}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{week.theme}</p>
                        <p className="text-[11px] text-surface-500 truncate">{(week.topics || []).join(' · ')}</p>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-surface-500" /> : <ChevronDown className="w-4 h-4 text-surface-500" />}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-white/[0.04] animate-fade-in space-y-3">
                        {/* Daily plan */}
                        {week.daily_plan?.map((day, di) => (
                          <div key={di}>
                            <p className="text-xs font-semibold text-surface-400 mb-1.5">{day.day}</p>
                            <div className="space-y-1.5 ml-2">
                              {day.tasks?.map((task, ti) => {
                                const cls = taskTypeColors[task.type] || 'text-surface-400 bg-surface-800/40';
                                return (
                                  <div key={ti} className="flex items-start gap-2.5 p-2 bg-surface-800/30 rounded-lg border border-white/[0.03]">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${cls} flex-shrink-0 mt-0.5`}>{task.type}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-surface-200">{task.description}</p>
                                      <p className="text-[10px] text-surface-500 mt-0.5">{task.topic} · {task.duration_minutes}min</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        {/* Week milestone & quiz goal */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-white/[0.04]">
                          {week.milestone && (
                            <div className="flex-1 p-2.5 bg-brand-500/5 rounded-lg border border-brand-500/10">
                              <p className="text-[10px] text-brand-400 uppercase tracking-wider font-semibold mb-0.5">Milestone</p>
                              <p className="text-xs text-surface-300">{week.milestone}</p>
                            </div>
                          )}
                          {week.quiz_goal && (
                            <div className="flex-1 p-2.5 bg-accent-violet/5 rounded-lg border border-accent-violet/10">
                              <p className="text-[10px] text-accent-violet uppercase tracking-wider font-semibold mb-0.5">Quiz Goal</p>
                              <p className="text-xs text-surface-300">{week.quiz_goal}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tips */}
          {result.tips?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-accent-amber" /> Study Tips
              </h3>
              <ul className="space-y-1.5">
                {result.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                    <span className="text-accent-amber mt-0.5">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Regenerate */}
          <div className="text-center pt-2">
            <button onClick={() => { setResult(null); setExpandedWeek(null); }} className="btn-secondary inline-flex items-center gap-2 mr-3">
              <RotateCcw className="w-4 h-4" /> New Roadmap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
