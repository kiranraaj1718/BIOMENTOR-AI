import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { featuresAPI } from '../api/client';
import {
  AlertOctagon, Sparkles, ArrowRight, Loader2, Target, TrendingUp,
  CheckCircle2, Heart, BookOpen, ChevronDown, ChevronUp, BarChart3,
  Clock, Zap
} from 'lucide-react';

const errorTypeIcons = {
  conceptual: { color: 'text-violet-400 bg-violet-500/10', label: 'Conceptual' },
  factual: { color: 'text-sky-400 bg-sky-500/10', label: 'Factual' },
  application: { color: 'text-amber-400 bg-amber-500/10', label: 'Application' },
  analysis: { color: 'text-rose-400 bg-rose-500/10', label: 'Analysis' },
};

export default function MistakeAnalyzerPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [expandedPlan, setExpandedPlan] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await featuresAPI.analyzeMistakes({ limit: 15 });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze mistakes');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-4 lg:p-8 animate-fade-in text-center mt-20">
        <div className="w-16 h-16 bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertOctagon className="w-8 h-8 text-surface-500" />
        </div>
        <h2 className="text-xl font-display font-bold text-white mb-2">Sign In Required</h2>
        <p className="text-surface-400 text-sm mb-6">Sign in to analyze your mistakes.</p>
        <button onClick={() => navigate('/auth')} className="btn-primary inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Sign In <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const totalErrors = result?.error_types
    ? Object.values(result.error_types).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="max-w-3xl mx-auto p-4 lg:p-8 animate-blur-in">
      {/* Header */}
      <div className="mb-8 animate-slide-up-spring" style={{ animationDelay: '0.05s' }}>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3 neon-text">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-rose/20 to-red-500/20 rounded-xl flex items-center justify-center gradient-border-animated">
            <AlertOctagon className="w-5 h-5 text-accent-rose" />
          </div>
          Mistake Analyzer
        </h1>
        <p className="text-sm text-surface-400 mt-2 ml-[52px]">Identify patterns in your quiz mistakes and get targeted improvement strategies</p>
        <div className="glow-line mt-4 w-24 ml-[52px]" />
      </div>

      {/* Launch */}
      {!result && (
        <div className="glass-card hover-tilt glass-card-shine p-8 text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent-rose/10 to-red-500/10 rounded-2xl flex items-center justify-center">
            <Target className="w-8 h-8 text-accent-rose" />
          </div>
          <h2 className="text-lg font-display font-semibold text-white mb-2">Analyze Your Mistakes</h2>
          <p className="text-surface-400 text-sm mb-6 max-w-md mx-auto">
            The AI will scan your recent quiz attempts, identify wrong answers, and find patterns to help you improve.
          </p>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button onClick={analyze} disabled={loading} className="btn-primary sparkle-hover inline-flex items-center gap-2 px-6 py-3 text-sm">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Zap className="w-4 h-4" /> Analyze Mistakes</>}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Summary */}
          <div className="glass-card glow-breathe p-5 corner-accents">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-800/60 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-accent-rose" />
              </div>
              <div>
                <p className="text-sm text-surface-300 leading-relaxed">{result.pattern_summary}</p>
                <p className="text-xs text-surface-500 mt-2">Analyzed {result.total_mistakes_analyzed} mistake{result.total_mistakes_analyzed !== 1 ? 's' : ''} from recent quizzes</p>
              </div>
            </div>
          </div>

          {/* Error Type Breakdown */}
          {totalErrors > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-4">Error Type Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
                {Object.entries(result.error_types || {}).map(([type, count]) => {
                  const info = errorTypeIcons[type] || { color: 'text-surface-400 bg-surface-800/40', label: type };
                  const pct = totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0;
                  return (
                    <div key={type} className={`p-3 rounded-xl ${info.color} bg-opacity-10 text-center`}>
                      <p className="text-xl font-display font-bold stat-value">{count}</p>
                      <p className="text-[10px] uppercase tracking-wider mt-0.5 opacity-80">{info.label}</p>
                      <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-current opacity-40 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weak Topics */}
          {result.weak_topics?.length > 0 && (
            <div className="glass-card hover-tilt glass-card-shine p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-accent-rose" /> Weak Topics
              </h3>
              <div className="space-y-3">
                {result.weak_topics.map((wt, i) => (
                  <div key={i} className="bg-surface-800/40 rounded-xl border border-white/[0.04] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-sm font-medium text-surface-200">{wt.topic}</p>
                        {wt.subtopic && <p className="text-[11px] text-surface-500">{wt.subtopic}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400 font-semibold">{wt.mistake_count} mistakes</span>
                        {wt.common_error_type && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${(errorTypeIcons[wt.common_error_type] || {}).color || 'text-surface-400 bg-surface-800'}`}>
                            {wt.common_error_type}
                          </span>
                        )}
                      </div>
                    </div>
                    {wt.explanation && <p className="text-xs text-surface-400 mt-1">{wt.explanation}</p>}
                    {wt.fix_strategy && (
                      <p className="text-xs text-brand-400 mt-1.5 flex items-start gap-1">
                        <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" /> {wt.fix_strategy}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvement Plan */}
          {result.improvement_plan?.length > 0 && (
            <div className="glass-card hover-tilt glass-card-shine p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-400" /> Improvement Plan
              </h3>
              <div className="space-y-2">
                {result.improvement_plan.map((step, i) => {
                  const isOpen = expandedPlan === i;
                  return (
                    <div key={i} className="bg-surface-800/40 rounded-xl border border-white/[0.04] overflow-hidden">
                      <button onClick={() => setExpandedPlan(isOpen ? null : i)} className="w-full flex items-center gap-3 p-3 text-left">
                        <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-brand-400">{step.step}</span>
                        </div>
                        <p className="text-sm text-surface-200 flex-1">{step.action}</p>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-surface-500" /> : <ChevronDown className="w-4 h-4 text-surface-500" />}
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-3 pt-1 border-t border-white/[0.04] animate-fade-in space-y-1">
                          {step.topic && <p className="text-xs text-surface-400"><span className="text-surface-500">Topic:</span> {step.topic}</p>}
                          {step.estimated_time_minutes && (
                            <p className="text-xs text-surface-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-surface-500" /> {step.estimated_time_minutes} minutes
                            </p>
                          )}
                          {step.expected_improvement && <p className="text-xs text-brand-400/80">{step.expected_improvement}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Encouragement */}
          {result.encouragement && (
            <div className="glass-card p-5 border border-brand-500/10">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-surface-300 leading-relaxed">{result.encouragement}</p>
              </div>
            </div>
          )}

          {/* Re-run */}
          <div className="text-center pt-2">
            <button onClick={analyze} disabled={loading} className="btn-secondary inline-flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Re-analyze
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
