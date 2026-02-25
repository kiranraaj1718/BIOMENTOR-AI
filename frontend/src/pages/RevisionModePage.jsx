import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { featuresAPI } from '../api/client';
import {
  Timer, Sparkles, ArrowRight, Loader2, Play, RotateCcw,
  ChevronLeft, ChevronRight, Check, X, BookOpen, Brain,
  Lightbulb, Zap, Pause, SkipForward, CheckCircle2, XCircle
} from 'lucide-react';

const QUICK_TOPICS = [
  'DNA Replication', 'Protein Synthesis', 'CRISPR-Cas9',
  'PCR', 'Gene Expression', 'Fermentation', 'Immunology',
  'Molecular Cloning', 'Bioinformatics', 'Vaccine Technology',
];

export default function RevisionModePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Session state
  const [sessionActive, setSessionActive] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  // Flash card state
  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizRevealed, setQuizRevealed] = useState({});

  const generate = async () => {
    if (!topic.trim()) { setError('Pick a topic'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await featuresAPI.generateRevision({ topic: topic.trim(), duration_minutes: duration });
      setResult(res.data);
      // Start session
      setSessionActive(true);
      setCurrentSection(0);
      setCardIndex(0);
      setCardFlipped(false);
      setQuizAnswers({});
      setQuizRevealed({});
      setTimeLeft(duration * 60);
      setPaused(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate revision');
    } finally {
      setLoading(false);
    }
  };

  // Timer
  useEffect(() => {
    if (sessionActive && !paused && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionActive, paused, timeLeft]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const sections = result?.sections || [];
  const flashCards = result?.flash_cards || [];
  const quickQuiz = result?.quick_quiz || [];

  const endSession = useCallback(() => {
    setSessionActive(false);
    clearInterval(timerRef.current);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-4 lg:p-8 animate-fade-in text-center mt-20">
        <div className="w-16 h-16 bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Timer className="w-8 h-8 text-surface-500" />
        </div>
        <h2 className="text-xl font-display font-bold text-white mb-2">Sign In Required</h2>
        <p className="text-surface-400 text-sm mb-6">Sign in to use revision mode.</p>
        <button onClick={() => navigate('/auth')} className="btn-primary inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Sign In <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // ── SETUP SCREEN ──
  if (!sessionActive) {
    return (
      <div className="max-w-2xl mx-auto p-4 lg:p-8 animate-blur-in">
        <div className="mb-8 animate-slide-up-spring" style={{ animationDelay: '0.05s' }}>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3 neon-text">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-amber/20 to-orange-500/20 rounded-xl flex items-center justify-center gradient-border-animated">
              <Timer className="w-5 h-5 text-accent-amber" />
            </div>
            5-Minute Revision Mode
          </h1>
          <p className="text-sm text-surface-400 mt-2 ml-[52px]">Quick, focused revision with flash cards, mnemonics, and mini-quizzes</p>
          <div className="glow-line mt-4 w-24 ml-[52px]" />
        </div>

        <div className="glass-card hover-tilt glass-card-shine p-6 space-y-5 corner-accents">
          {/* Topic */}
          <div>
            <label className="block text-xs font-semibold text-surface-400 mb-1.5 uppercase tracking-wider">Topic</label>
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="What do you want to revise?" className="input-field" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TOPICS.map(t => (
              <button key={t} onClick={() => setTopic(t)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${topic === t ? 'border-brand-500/40 bg-brand-500/10 text-brand-400' : 'border-white/[0.06] text-surface-400 hover:text-white hover:border-white/[0.1]'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-surface-400 mb-1.5 uppercase tracking-wider">Duration</label>
            <div className="flex gap-2">
              {[3, 5, 10].map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${duration === d ? 'border-brand-500/40 bg-brand-500/10 text-brand-400' : 'border-white/[0.06] text-surface-400 hover:border-white/[0.1]'}`}>
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button onClick={generate} disabled={loading} className="btn-primary sparkle-hover w-full flex items-center justify-center gap-2 py-3">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Preparing revision...</> : <><Play className="w-4 h-4" /> Start Revision</>}
          </button>
        </div>

        {/* Key takeaways from previous session */}
        {result?.key_takeaways?.length > 0 && (
          <div className="glass-card p-5 mt-4">
            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-accent-amber" /> Previous Session Takeaways
            </h3>
            <ul className="space-y-1.5">
              {result.key_takeaways.map((t, i) => (
                <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-amber mt-1.5 flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // ── ACTIVE SESSION ──
  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-8 animate-blur-in">
      {/* Session Header */}
      <div className="glass-card glow-breathe p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${timeLeft <= 60 ? 'bg-red-500/10' : 'bg-accent-amber/10'}`}>
            <Timer className={`w-5 h-5 ${timeLeft <= 60 ? 'text-red-400' : 'text-accent-amber'}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{result?.topic || topic}</p>
            <p className={`text-lg font-display font-bold ${timeLeft <= 60 ? 'text-red-400' : 'text-white'}`}>{formatTime(timeLeft)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPaused(!paused)} className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors text-surface-400 hover:text-white">
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button onClick={endSession} className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-xl transition-all">
            End
          </button>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {sections.map((s, i) => (
          <button key={i} onClick={() => setCurrentSection(i)}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-all ${currentSection === i ? 'border-brand-500/40 bg-brand-500/10 text-brand-400' : 'border-white/[0.06] text-surface-500 hover:text-white'}`}>
            {s.title}
          </button>
        ))}
        {flashCards.length > 0 && (
          <button onClick={() => setCurrentSection('cards')}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-all ${currentSection === 'cards' ? 'border-brand-500/40 bg-brand-500/10 text-brand-400' : 'border-white/[0.06] text-surface-500 hover:text-white'}`}>
            Flash Cards
          </button>
        )}
        {quickQuiz.length > 0 && (
          <button onClick={() => setCurrentSection('quiz')}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-all ${currentSection === 'quiz' ? 'border-brand-500/40 bg-brand-500/10 text-brand-400' : 'border-white/[0.06] text-surface-500 hover:text-white'}`}>
            Quick Quiz
          </button>
        )}
      </div>

      {/* Section Content */}
      {typeof currentSection === 'number' && sections[currentSection] && (
        <div className="glass-card p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-accent-teal" />
            <h2 className="text-sm font-semibold text-white">{sections[currentSection].title}</h2>
            {sections[currentSection].time_minutes && (
              <span className="text-[10px] text-surface-500 ml-auto flex items-center gap-1"><Timer className="w-3 h-3" />{sections[currentSection].time_minutes}m</span>
            )}
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-surface-300 leading-relaxed whitespace-pre-wrap">
            {sections[currentSection].content}
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={() => setCurrentSection(Math.max(0, currentSection - 1))} disabled={currentSection === 0}
              className="btn-ghost text-xs flex items-center gap-1 disabled:opacity-30">
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button
              onClick={() => {
                if (currentSection < sections.length - 1) setCurrentSection(currentSection + 1);
                else if (flashCards.length > 0) setCurrentSection('cards');
                else if (quickQuiz.length > 0) setCurrentSection('quiz');
              }}
              className="btn-ghost text-xs flex items-center gap-1">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Flash Cards */}
      {currentSection === 'cards' && flashCards.length > 0 && (
        <div className="glass-card p-6 animate-fade-in text-center">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-accent-violet" /> Flash Cards
            </h2>
            <span className="text-xs text-surface-500">{cardIndex + 1} / {flashCards.length}</span>
          </div>

          <button
            onClick={() => setCardFlipped(!cardFlipped)}
            className="w-full min-h-[160px] bg-surface-800/60 border border-white/[0.06] hover:border-white/[0.1] rounded-2xl p-6 flex items-center justify-center transition-all cursor-pointer hover-tilt"
          >
            <div className="animate-fade-in">
              {!cardFlipped ? (
                <div>
                  <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-2">Question</p>
                  <p className="text-lg font-display font-semibold text-white">{flashCards[cardIndex]?.front}</p>
                  <p className="text-xs text-surface-500 mt-3">Tap to reveal answer</p>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] text-brand-400 uppercase tracking-wider mb-2">Answer</p>
                  <p className="text-lg font-display font-semibold text-brand-300">{flashCards[cardIndex]?.back}</p>
                </div>
              )}
            </div>
          </button>

          <div className="flex justify-center gap-3 mt-4">
            <button onClick={() => { setCardIndex(Math.max(0, cardIndex - 1)); setCardFlipped(false); }} disabled={cardIndex === 0}
              className="btn-ghost text-xs flex items-center gap-1 disabled:opacity-30">
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button onClick={() => { setCardIndex(Math.min(flashCards.length - 1, cardIndex + 1)); setCardFlipped(false); }} disabled={cardIndex >= flashCards.length - 1}
              className="btn-ghost text-xs flex items-center gap-1 disabled:opacity-30">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Quiz */}
      {currentSection === 'quiz' && quickQuiz.length > 0 && (
        <div className="glass-card p-6 animate-fade-in">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-accent-amber" /> Quick Quiz
          </h2>
          <div className="space-y-4">
            {quickQuiz.map((q, qi) => {
              const answered = quizAnswers[qi] !== undefined;
              const revealed = quizRevealed[qi];
              const isCorrect = answered && quizAnswers[qi] === q.correct;
              return (
                <div key={qi} className="bg-surface-800/40 rounded-xl border border-white/[0.04] p-4">
                  <p className="text-sm text-surface-200 font-medium mb-3">{qi + 1}. {q.question}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(q.options || []).map((opt, oi) => {
                      const letter = opt[0];
                      const selected = quizAnswers[qi] === letter;
                      const correctOpt = letter === q.correct;
                      let cls = 'border-white/[0.06] text-surface-300 hover:border-white/[0.1]';
                      if (revealed) {
                        if (correctOpt) cls = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
                        else if (selected && !correctOpt) cls = 'border-red-500/40 bg-red-500/10 text-red-300';
                      } else if (selected) {
                        cls = 'border-brand-500/40 bg-brand-500/10 text-brand-400';
                      }
                      return (
                        <button key={oi}
                          onClick={() => { if (!revealed) setQuizAnswers(p => ({ ...p, [qi]: letter })); }}
                          className={`text-left text-xs p-2.5 rounded-xl border transition-all ${cls}`}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {answered && !revealed && (
                    <button onClick={() => setQuizRevealed(p => ({ ...p, [qi]: true }))}
                      className="mt-2 text-xs text-brand-400 hover:text-brand-300">Check answer →</button>
                  )}
                  {revealed && (
                    <div className="mt-2 flex items-start gap-2 animate-fade-in">
                      {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                      <p className="text-xs text-surface-400">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mnemonics & Takeaways */}
      {(result?.mnemonics?.length > 0 || result?.key_takeaways?.length > 0) && (
        <div className="glass-card p-5 mt-4">
          {result.mnemonics?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-accent-amber uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" /> Mnemonics
              </h3>
              <ul className="space-y-1">
                {result.mnemonics.map((m, i) => (
                  <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                    <span className="text-accent-amber">•</span> {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.key_takeaways?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Key Takeaways
              </h3>
              <ul className="space-y-1">
                {result.key_takeaways.map((t, i) => (
                  <li key={i} className="text-sm text-surface-300 flex items-start gap-2">
                    <span className="text-brand-400">•</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
