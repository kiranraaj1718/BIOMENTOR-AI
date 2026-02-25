import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { featuresAPI } from '../api/client';
import {
  TrendingUp, Target, AlertTriangle, CheckCircle2, ArrowRight,
  Sparkles, Loader2, BarChart3, Gauge, BookOpen, Zap, ChevronDown,
  ChevronUp, Clock
} from 'lucide-react';

const readinessColors = {
  strong: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  moderate: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  developing: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  weak: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function ExamPredictorPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [expandedTopic, setExpandedTopic] = useState(null);

  const runPrediction = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await featuresAPI.predictExam({});
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-4 lg:p-8 animate-fade-in text-center mt-20">
        <div className="w-16 h-16 bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <TrendingUp className="w-8 h-8 text-surface-500" />
        </div>
        <h2 className="text-xl font-display font-bold text-white mb-2">Sign In Required</h2>
        <p className="text-surface-400 text-sm mb-6">Sign in to predict your exam success.</p>
        <button onClick={() => navigate('/auth')} className="btn-primary inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Sign In <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const prob = result?.overall_probability;
  const probPct = prob != null ? Math.round(prob * 100) : null;
  const probColor = probPct >= 75 ? 'text-emerald-400' : probPct >= 55 ? 'text-amber-400' : 'text-red-400';
  const probRing = probPct >= 75 ? 'border-emerald-500/30' : probPct >= 55 ? 'border-amber-500/30' : 'border-red-500/30';

  return (
    <div className="max-w-3xl mx-auto p-4 lg:p-8 animate-blur-in">
      {/* Header */}
      <div className="mb-8 animate-slide-up-spring" style={{ animationDelay: '0.05s' }}>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3 neon-text">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-400/20 to-brand-500/20 rounded-xl flex items-center justify-center animate-pop-in gradient-border-animated">
            <TrendingUp className="w-5 h-5 text-brand-400" />
          </div>
          Exam Probability Predictor
        </h1>
        <p className="text-sm text-surface-400 mt-2 ml-[52px]">AI analysis of your readiness based on quiz history and learning progress</p>
        <div className="glow-line mt-4 w-24 ml-[52px]" />
      </div>

      {/* Generate button */}
      {!result && (
        <div className="glass-card hover-tilt glass-card-shine p-8 text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-brand-400/10 to-brand-500/10 rounded-2xl flex items-center justify-center animate-pop-in">
            <Gauge className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-lg font-display font-semibold text-white mb-2">Ready to predict?</h2>
          <p className="text-surface-400 text-sm mb-6 max-w-md mx-auto">
            The AI will analyze your quiz scores, learning progress, and knowledge gaps to estimate your exam success probability.
          </p>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button onClick={runPrediction} disabled={loading} className="btn-primary sparkle-hover inline-flex items-center gap-2 px-6 py-3 text-sm group">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4 group-hover:animate-wiggle" /> Predict My Score</>}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fade-in-up stagger-children">
          {/* Score Gauge */}
          <div className="glass-card glow-breathe p-6 text-center corner-accents">
            <div className={`w-28 h-28 mx-auto mb-4 rounded-full border-4 ${probRing} flex items-center justify-center bg-surface-800/40`}>
              <div className="text-center">
                <span className={`text-3xl font-display font-bold ${probColor} stat-value`}>{probPct}%</span>
                <p className="text-[10px] text-surface-500 uppercase tracking-wider">probability</p>
              </div>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${probPct >= 75 ? 'bg-emerald-500/10 text-emerald-400' : probPct >= 55 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
              Confidence: {result.confidence_level}
            </span>

            {/* Score estimate bar */}
            {result.score_estimate && (
              <div className="mt-5 max-w-sm mx-auto">
                <p className="text-xs text-surface-500 mb-2 uppercase tracking-wider">Score Estimate Range</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-red-400 font-semibold w-8 text-right">{result.score_estimate.low}</span>
                  <div className="flex-1 h-2.5 bg-surface-800 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/40 via-amber-500/40 to-emerald-500/40 rounded-full" />
                    <div className="absolute top-0 h-full w-1 bg-white rounded-full" style={{ left: `${result.score_estimate.expected}%` }} />
                  </div>
                  <span className="text-emerald-400 font-semibold w-8">{result.score_estimate.high}</span>
                </div>
                <p className="text-center text-xs text-surface-400 mt-1">Expected: <span className="text-white font-semibold">{result.score_estimate.expected}</span></p>
              </div>
            )}
          </div>

          {/* Summary */}
          {result.summary && (
            <div className="glass-card hover-tilt glass-card-shine p-5">
              <p className="text-sm text-surface-300 leading-relaxed">{result.summary}</p>
            </div>
          )}

          {/* Strong & Weak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
            <div className="glass-card hover-tilt glass-card-shine p-5">
              <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Strong Areas
              </h3>
              <div className="space-y-2">
                {(result.strong_areas || []).map((a, i) => (
                  <p key={i} className="text-sm text-surface-200 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" /> {a}
                  </p>
                ))}
                {(!result.strong_areas || result.strong_areas.length === 0) && (
                  <p className="text-sm text-surface-500 italic">Keep studying to build strengths!</p>
                )}
              </div>
            </div>
            <div className="glass-card hover-tilt glass-card-shine p-5">
              <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Weak Areas
              </h3>
              <div className="space-y-2">
                {(result.weak_areas || []).map((a, i) => (
                  <p key={i} className="text-sm text-surface-200 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" /> {a}
                  </p>
                ))}
                {(!result.weak_areas || result.weak_areas.length === 0) && (
                  <p className="text-sm text-surface-500 italic">Great — no major weaknesses detected!</p>
                )}
              </div>
            </div>
          </div>

          {/* Topic Predictions */}
          {result.topic_predictions?.length > 0 && (
            <div className="glass-card hover-tilt glass-card-shine p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-accent-teal" /> Topic-Level Predictions
              </h3>
              <div className="space-y-2">
                {result.topic_predictions.map((tp, i) => {
                  const pct = Math.round((tp.probability || 0) * 100);
                  const cls = readinessColors[tp.readiness] || readinessColors.developing;
                  const isOpen = expandedTopic === i;
                  return (
                    <div key={i} className="bg-surface-800/40 rounded-xl border border-white/[0.04] overflow-hidden">
                      <button onClick={() => setExpandedTopic(isOpen ? null : i)} className="w-full flex items-center gap-3 p-3 text-left">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-surface-200 truncate">{tp.topic}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${cls}`}>{tp.readiness}</span>
                        <span className="text-sm font-semibold text-white w-10 text-right">{pct}%</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-surface-500" /> : <ChevronDown className="w-4 h-4 text-surface-500" />}
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-3 pt-1 border-t border-white/[0.04] animate-fade-in space-y-2">
                          {tp.risk_factors?.length > 0 && (
                            <div>
                              <p className="text-[10px] text-red-400/80 uppercase font-semibold mb-1">Risk Factors</p>
                              {tp.risk_factors.map((r, j) => <p key={j} className="text-xs text-surface-400 ml-2">• {r}</p>)}
                            </div>
                          )}
                          {tp.boost_actions?.length > 0 && (
                            <div>
                              <p className="text-[10px] text-emerald-400/80 uppercase font-semibold mb-1">Boost Actions</p>
                              {tp.boost_actions.map((b, j) => <p key={j} className="text-xs text-surface-400 ml-2">• {b}</p>)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Study Recommendations */}
          {result.study_recommendations?.length > 0 && (
            <div className="glass-card hover-tilt glass-card-shine p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent-amber" /> Study Recommendations
              </h3>
              <div className="space-y-2">
                {result.study_recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-surface-800/40 rounded-xl border border-white/[0.04]">
                    <div className="w-6 h-6 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-brand-400">{rec.priority}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-surface-200">{rec.action}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${rec.expected_impact === 'high' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {rec.expected_impact} impact
                        </span>
                        {rec.time_needed_minutes && (
                          <span className="text-[10px] text-surface-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {rec.time_needed_minutes}m
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Re-run */}
          <div className="text-center pt-2">
            <button onClick={runPrediction} disabled={loading} className="btn-secondary inline-flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Re-analyze
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
