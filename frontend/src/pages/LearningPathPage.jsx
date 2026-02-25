import { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/client';
import { Link } from 'react-router-dom';
import { Route, Target, BookOpen, Clock, ArrowRight, CheckCircle2, AlertTriangle, TrendingUp, Sparkles, Brain } from 'lucide-react';

const ACTION_CONFIG = {
  review: { color: 'bg-amber-500/15 text-amber-400 border-amber-500/20', icon: AlertTriangle, label: 'Review' },
  study: { color: 'bg-blue-500/15 text-blue-400 border-blue-500/20', icon: BookOpen, label: 'Study' },
  practice: { color: 'bg-purple-500/15 text-purple-400 border-purple-500/20', icon: Brain, label: 'Practice' },
  advance: { color: 'bg-brand-500/15 text-brand-400 border-brand-500/20', icon: TrendingUp, label: 'Advance' },
};

export default function LearningPathPage() {
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getLearningPath()
      .then(res => setPathData(res.data))
      .catch(() => setPathData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="dna-loader"><span></span><span></span><span></span></div>
      </div>
    );
  }

  if (!pathData) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <Route className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <p className="text-surface-400 mb-4">Unable to load learning path. Make sure the backend is running.</p>
          <Link to="/quiz" className="btn-primary inline-flex items-center gap-2">
            <Brain className="w-4 h-4" /> Take a Quiz First
          </Link>
        </div>
      </div>
    );
  }

  const { assessment, strengths, weaknesses, recommendations, next_milestone, overall_progress } = pathData;
  const progressPercent = Math.round((overall_progress || 0) * 100);

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 animate-blur-in">
      <div className="mb-8 animate-slide-up-spring" style={{ animationDelay: '0.05s' }}>
        <h1 className="text-2xl font-bold text-white mb-2 neon-text">Your Learning Path</h1>
        <p className="text-surface-400">Personalized recommendations based on your performance analytics</p>
        <div className="glow-line mt-4 w-24" />
      </div>

      {/* Overall Progress */}
      <div className="glass-card glow-breathe p-6 mb-6 border-brand-500/20 corner-accents">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-brand-400" />
              AI Assessment
            </h2>
            <p className="text-sm text-surface-300">{assessment}</p>
          </div>
          <div className="text-center flex-shrink-0">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="#1e293b" strokeWidth="6" fill="none" />
                <circle
                  cx="40" cy="40" r="34"
                  stroke="#10b981"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - overall_progress)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-brand-400 stat-value">{progressPercent}%</span>
              </div>
            </div>
            <span className="text-xs text-surface-400 mt-1 block">Overall</span>
          </div>
        </div>

        {/* Next Milestone */}
        {next_milestone && (
          <div className="bg-surface-800/50 rounded-xl p-3 flex items-center gap-3">
            <Target className="w-5 h-5 text-brand-400 flex-shrink-0" />
            <div>
              <span className="text-xs text-surface-400 block">Next Milestone</span>
              <span className="text-sm text-white">{next_milestone}</span>
            </div>
          </div>
        )}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 stagger-children">
        <div className="glass-card hover-tilt glass-card-shine p-5">
          <h3 className="text-sm font-semibold text-brand-400 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Strengths
          </h3>
          <ul className="space-y-2">
            {strengths?.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-surface-300">
                <div className="w-1.5 h-1.5 bg-brand-400 rounded-full" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-card hover-tilt glass-card-shine p-5">
          <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Areas to Improve
          </h3>
          <ul className="space-y-2">
            {weaknesses?.map((w, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-surface-300">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Route className="w-5 h-5 text-brand-400" />
        Recommended Path
      </h2>
      <div className="space-y-3 mb-6 stagger-children">
        {recommendations?.map((rec, i) => {
          const config = ACTION_CONFIG[rec.action] || ACTION_CONFIG.study;
          return (
            <div key={i} className="glass-card-hover hover-tilt glass-card-shine p-5 relative">
              {/* Priority indicator */}
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 rounded-l-2xl" style={{ opacity: 1 - (i * 0.2) }} />

              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color} border`}>
                  <config.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">{rec.topic}</h3>
                    <span className={`badge border ${config.color}`}>{config.label}</span>
                    <span className="badge-blue">Priority {rec.priority}</span>
                  </div>
                  <p className="text-sm text-surface-400 mb-3">{rec.reason}</p>

                  {/* Resources */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {rec.resources?.map((r, j) => (
                      <span key={j} className="text-xs bg-surface-800 px-2.5 py-1 rounded-lg text-surface-300">
                        {r}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-surface-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {rec.estimated_time_minutes} min
                    </span>
                    <Link to="/quiz" className="flex items-center gap-1 text-brand-400 hover:text-brand-300 transition-colors">
                      Practice this topic <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/quiz" className="btn-primary sparkle-hover flex-1 flex items-center justify-center gap-2 group">
          <Brain className="w-4 h-4 group-hover:animate-wiggle" /> Take a Quiz
        </Link>
        <Link to="/chat" className="btn-secondary flex-1 flex items-center justify-center gap-2">
          <BookOpen className="w-4 h-4" /> Study with AI Tutor
        </Link>
      </div>
    </div>
  );
}
