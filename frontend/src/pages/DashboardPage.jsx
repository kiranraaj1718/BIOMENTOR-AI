import { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/client';
import { BarChart3, TrendingUp, Brain, Clock, Target, MessageSquare, Award, BookOpen, ArrowUpRight, ArrowDownRight, Minus, GitCompare, Sparkles } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Cell } from 'recharts';

/* ── Topic comparison colors ── */
const TOPIC_CHART_COLORS = ['#14b8a6', '#38bdf8', '#a78bfa', '#f59e0b', '#fb7185', '#34d399'];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [compareMode, setCompareMode] = useState('bar'); // bar | radar

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="dna-loader"><span></span><span></span><span></span></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <p className="text-surface-400">No analytics data available yet. Start learning to see your progress!</p>
        </div>
      </div>
    );
  }

  const { summary, topic_mastery, score_trend } = data;

  // Prepare radar chart data
  const radarData = topic_mastery?.map(t => ({
    topic: t.topic.replace(/\sand\s/g, ' & ').split(' ').slice(0, 2).join(' '),
    mastery: t.mastery,
    fullMark: 100,
  })) || [];

  // Prepare comparison bar chart data (each topic as a group)
  const comparisonBarData = topic_mastery?.map(t => ({
    name: t.topic.replace(/\sand\s/g, ' & ').split(' ').slice(0, 2).join(' '),
    mastery: t.mastery,
    questions: t.questions_answered,
    fullName: t.topic,
  })) || [];

  // Trend delta (first vs last score)
  const trendDelta = score_trend?.length >= 2
    ? score_trend[score_trend.length - 1].score - score_trend[0].score
    : 0;

  // Best and weakest topics
  const sorted = [...(topic_mastery || [])].sort((a, b) => b.mastery - a.mastery);
  const bestTopic = sorted[0];
  const weakTopic = sorted[sorted.length - 1];

  const statCards = [
    { label: 'Quizzes Taken', value: summary.total_quizzes, icon: Brain, color: 'text-accent-teal', bg: 'bg-accent-teal/10', border: 'border-accent-teal/15' },
    { label: 'Avg Score', value: `${summary.average_score}%`, icon: Target, color: 'text-accent-sky', bg: 'bg-accent-sky/10', border: 'border-accent-sky/15' },
    { label: 'Questions', value: summary.total_questions_answered, icon: Award, color: 'text-accent-violet', bg: 'bg-accent-violet/10', border: 'border-accent-violet/15' },
    { label: 'Accuracy', value: `${summary.accuracy}%`, icon: TrendingUp, color: 'text-accent-amber', bg: 'bg-accent-amber/10', border: 'border-accent-amber/15' },
    { label: 'Study Time', value: `${summary.total_study_time_minutes}m`, icon: Clock, color: 'text-accent-rose', bg: 'bg-accent-rose/10', border: 'border-accent-rose/15' },
    { label: 'Chat Sessions', value: summary.chat_sessions, icon: MessageSquare, color: 'text-accent-mint', bg: 'bg-accent-mint/10', border: 'border-accent-mint/15' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8 animate-blur-in">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4 animate-slide-up-spring" style={{ animationDelay: '0.1s' }}>
        <div>
          <h1 className="text-2xl font-display font-bold text-white mb-2 neon-text">Performance Dashboard</h1>
          <p className="text-surface-400">Track your learning progress across all biotechnology topics</p>
          <div className="glow-line mt-3 w-24" />
        </div>
        {trendDelta !== 0 && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
            trendDelta > 0 ? 'bg-accent-teal/10 border-accent-teal/20 text-accent-teal' : 'bg-accent-rose/10 border-accent-rose/20 text-accent-rose'
          } glow-breathe`}>
            {trendDelta > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span className="text-sm font-semibold">{trendDelta > 0 ? '+' : ''}{trendDelta}% overall trend</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 stagger-children" style={{ animationDelay: '0.2s' }}>
        {statCards.map((stat) => (
          <div key={stat.label} className={`glass-card p-4 border ${stat.border} hover-tilt glass-card-shine glow-breathe transition-all corner-accents`}>
            <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
            </div>
            <div className="stat-value !text-xl">{stat.value}</div>
            <div className="text-xs text-surface-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Insights Row */}
      {bestTopic && weakTopic && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 stagger-children" style={{ animationDelay: '0.35s' }}>
          <div className="glass-card p-4 flex items-center gap-4 border border-accent-teal/10 hover-tilt glass-card-shine glow-breathe">
            <div className="w-11 h-11 bg-accent-teal/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-accent-teal" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-surface-400 mb-0.5">Strongest Topic</p>
              <p className="text-sm font-semibold text-white truncate">{bestTopic.topic}</p>
              <p className="text-xs text-accent-teal font-medium">{bestTopic.mastery}% mastery</p>
            </div>
          </div>
          <div className="glass-card p-4 flex items-center gap-4 border border-accent-amber/10 hover-tilt glass-card-shine glow-breathe">
            <div className="w-11 h-11 bg-accent-amber/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-accent-amber" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-surface-400 mb-0.5">Needs Improvement</p>
              <p className="text-sm font-semibold text-white truncate">{weakTopic.topic}</p>
              <p className="text-xs text-accent-amber font-medium">{weakTopic.mastery}% mastery</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 stagger-children" style={{ animationDelay: '0.5s' }}>
        {/* Score Trend */}
        <div className="glass-card p-6 hover-tilt glass-card-shine">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent-teal" />
            Score Trend
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={score_trend}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => val ? new Date(val).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : ''}
                />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(value) => [`${value}%`, 'Score']}
                />
                <Area type="monotone" dataKey="score" stroke="#14b8a6" fill="url(#scoreGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Mastery Radar */}
        <div className="glass-card p-6 hover-tilt glass-card-shine">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-accent-violet" />
            Topic Mastery
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="topic" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Mastery" dataKey="mastery" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── TOPIC COMPARISON SECTION ── */}
      <div className="glass-card p-6 mb-6 animate-slide-up-spring" style={{ animationDelay: '0.65s' }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-accent-sky" />
            Topic Comparison Report
          </h2>
          <div className="flex gap-2">
            {['bar', 'radar'].map(mode => (
              <button
                key={mode}
                onClick={() => setCompareMode(mode)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  compareMode === mode
                    ? 'bg-accent-sky/10 border-accent-sky/30 text-accent-sky'
                    : 'bg-surface-800/50 border-surface-700/50 text-surface-400 hover:text-white'
                }`}
              >
                {mode === 'bar' ? 'Bar Chart' : 'Radar'}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {compareMode === 'bar' ? (
              <BarChart data={comparisonBarData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(value, name) => [name === 'mastery' ? `${value}%` : value, name === 'mastery' ? 'Mastery' : 'Questions']}
                />
                <Bar dataKey="mastery" radius={[6, 6, 0, 0]} name="Mastery %">
                  {comparisonBarData.map((_, i) => (
                    <Cell key={i} fill={TOPIC_CHART_COLORS[i % TOPIC_CHART_COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="topic" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Mastery" dataKey="mastery" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
        {/* Topic comparison table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700/50">
                <th className="text-left text-xs text-surface-400 font-medium pb-2 pl-2">Topic</th>
                <th className="text-center text-xs text-surface-400 font-medium pb-2">Mastery</th>
                <th className="text-center text-xs text-surface-400 font-medium pb-2">Questions</th>
                <th className="text-center text-xs text-surface-400 font-medium pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {topic_mastery?.map((topic, i) => (
                <tr key={topic.topic} className="border-b border-surface-800/50 hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 pl-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TOPIC_CHART_COLORS[i % TOPIC_CHART_COLORS.length] }} />
                      <span className="text-surface-200 text-xs">{topic.topic}</span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={`text-xs font-bold ${
                      topic.mastery >= 80 ? 'text-accent-teal' : topic.mastery >= 60 ? 'text-accent-amber' : 'text-accent-rose'
                    }`}>{topic.mastery}%</span>
                  </td>
                  <td className="text-center text-xs text-surface-400">{topic.questions_answered}</td>
                  <td className="text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      topic.mastery >= 80 ? 'bg-accent-teal/10 text-accent-teal' : topic.mastery >= 60 ? 'bg-accent-amber/10 text-accent-amber' : 'bg-accent-rose/10 text-accent-rose'
                    }`}>
                      {topic.mastery >= 80 ? <><ArrowUpRight className="w-3 h-3" /> Strong</> : topic.mastery >= 60 ? <><Minus className="w-3 h-3" /> Average</> : <><ArrowDownRight className="w-3 h-3" /> Improve</>}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Topic Progress Bars */}
      <div className="glass-card p-6 animate-slide-up-spring" style={{ animationDelay: '0.8s' }}>
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent-indigo" />
          Topic Progress
        </h2>
        <div className="space-y-4">
          {topic_mastery?.map((topic, i) => (
            <div key={topic.topic}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-surface-200">{topic.topic}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-surface-400">{topic.questions_answered} questions</span>
                  <span className={`text-sm font-semibold ${
                    topic.mastery >= 80 ? 'text-accent-teal' : topic.mastery >= 60 ? 'text-accent-amber' : 'text-accent-rose'
                  }`}>{topic.mastery}%</span>
                </div>
              </div>
              <div className="h-2.5 bg-surface-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${topic.mastery}%`, backgroundColor: TOPIC_CHART_COLORS[i % TOPIC_CHART_COLORS.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
