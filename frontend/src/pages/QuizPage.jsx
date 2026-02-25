import { useState, useEffect } from 'react';
import { quizAPI } from '../api/client';
import { Brain, Clock, CheckCircle2, XCircle, Trophy, ArrowRight, RotateCcw, Loader2, Sparkles, ChevronRight } from 'lucide-react';

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', color: 'badge-green', desc: 'Recall and basic understanding' },
  { value: 'medium', label: 'Medium', color: 'badge-blue', desc: 'Application and analysis' },
  { value: 'hard', label: 'Hard', color: 'badge-red', desc: 'Advanced problem solving' },
  { value: 'adaptive', label: 'Adaptive', color: 'badge-purple', desc: 'Adjusts to your level' },
];

export default function QuizPage() {
  const [step, setStep] = useState('setup'); // setup, quiz, results
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizId, setQuizId] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  // Load topics
  useEffect(() => {
    quizAPI.getTopics()
      .then(res => setTopics(res.data))
      .catch(() => {
        // Demo topics
        setTopics([
          { id: 'mol_bio_101', name: 'Molecular Biology Fundamentals', difficulty: 'beginner', subtopics: ['DNA', 'RNA', 'Proteins'] },
          { id: 'gen_eng_201', name: 'Genetic Engineering', difficulty: 'intermediate', subtopics: ['CRISPR', 'PCR', 'Cloning'] },
          { id: 'bioinfo_301', name: 'Bioinformatics', difficulty: 'intermediate', subtopics: ['Sequence Analysis', 'Genomics'] },
          { id: 'bpe_401', name: 'Bioprocess Engineering', difficulty: 'advanced', subtopics: ['Fermentation', 'DSP'] },
          { id: 'imm_vax_501', name: 'Immunology and Vaccines', difficulty: 'advanced', subtopics: ['Immunity', 'Vaccines', 'CAR-T'] },
          { id: 'ind_bio_601', name: 'Industrial Biotechnology', difficulty: 'intermediate', subtopics: ['Enzymes', 'Metabolic Engineering'] },
        ]);
      });
  }, []);

  // Timer
  useEffect(() => {
    let timer;
    if (step === 'quiz' && startTime) {
      timer = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, startTime]);

  const generateQuiz = async () => {
    if (!selectedTopic) return;
    setLoading(true);
    try {
      const res = await quizAPI.generate({
        topic: selectedTopic,
        difficulty,
        num_questions: numQuestions,
      });
      setQuestions(res.data.questions);
      setQuizId(res.data.quiz_id);
      setAnswers({});
      setCurrentQ(0);
      setStartTime(Date.now());
      setStep('quiz');
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitQuiz = async () => {
    setLoading(true);
    try {
      const res = await quizAPI.submit({
        quiz_id: quizId,
        answers,
        time_taken_seconds: elapsed,
      });
      setResults(res.data);
      setStep('results');
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setStep('setup');
    setQuestions([]);
    setAnswers({});
    setResults(null);
    setQuizId(null);
    setElapsed(0);
    setStartTime(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ----- SETUP STEP -----
  if (step === 'setup') {
    return (
      <div className="max-w-3xl mx-auto p-4 lg:p-8  animate-blur-in">
        <div className="text-center mb-8 animate-slide-up-spring" style={{ animationDelay: '0.05s' }}>
          <div className="w-14 h-14 bg-brand-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-breathe gradient-border-animated">
            <Brain className="w-7 h-7 text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 neon-text">Adaptive Quiz</h1>
          <p className="text-surface-400">Test your biotechnology knowledge with AI-generated questions</p>
          <div className="glow-line mx-auto mt-4 w-24" />
        </div>

        {/* Topic Selection */}
        <div className="glass-card p-6 mb-4 hover-tilt glass-card-shine corner-accents" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-sm font-semibold text-white mb-3">Select Topic</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 stagger-children">
            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.name)}
                className={`p-3 rounded-xl text-left transition-all border ${
                  selectedTopic === topic.name
                    ? 'bg-brand-600/15 border-brand-500/30 text-white'
                    : 'bg-surface-800/50 border-surface-700/50 text-surface-300 hover:border-surface-600'
                }`}
              >
                <span className="text-sm font-medium block">{topic.name}</span>
                <span className="text-xs text-surface-400 mt-0.5 block">
                  {topic.subtopics?.slice(0, 3).join(' • ')}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="glass-card p-6 mb-4 hover-tilt glass-card-shine" style={{ animationDelay: '0.15s' }}>
          <h2 className="text-sm font-semibold text-white mb-3">Difficulty Level</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 stagger-children">
            {DIFFICULTY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDifficulty(opt.value)}
                className={`p-3 rounded-xl text-center transition-all border ${
                  difficulty === opt.value
                    ? 'bg-brand-600/15 border-brand-500/30'
                    : 'bg-surface-800/50 border-surface-700/50 hover:border-surface-600'
                }`}
              >
                <span className={`${opt.color} mb-1 inline-block`}>{opt.label}</span>
                <span className="text-xs text-surface-400 block">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Question Count */}
        <div className="glass-card p-6 mb-6 hover-tilt glass-card-shine" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-sm font-semibold text-white mb-3">Number of Questions</h2>
          <div className="flex gap-2 stagger-children">
            {[3, 5, 10].map(n => (
              <button
                key={n}
                onClick={() => setNumQuestions(n)}
                className={`px-6 py-2 rounded-xl transition-all border ${
                  numQuestions === n
                    ? 'bg-brand-600/15 border-brand-500/30 text-brand-400'
                    : 'bg-surface-800/50 border-surface-700/50 text-surface-300 hover:border-surface-600'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generateQuiz}
          disabled={!selectedTopic || loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base sparkle-hover group"
          style={{ animationDelay: '0.25s' }}
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Generating Quiz...</>
          ) : (
            <><Sparkles className="w-5 h-5 group-hover:animate-wiggle" /> Generate Quiz</>
          )}
        </button>
      </div>
    );
  }

  // ----- QUIZ STEP -----
  if (step === 'quiz' && questions.length > 0) {
    const question = questions[currentQ];
    const progress = ((currentQ + 1) / questions.length) * 100;
    const answeredAll = Object.keys(answers).length === questions.length;

    return (
      <div className="max-w-3xl mx-auto p-4 lg:p-8 animate-blur-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-slide-up-spring" style={{ animationDelay: '0.05s' }}>
          <div>
            <span className="badge-blue">{selectedTopic}</span>
            <span className="badge-purple ml-2">{difficulty}</span>
          </div>
          <div className="flex items-center gap-2 text-surface-300">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono">{formatTime(elapsed)}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-surface-400 mb-1.5">
            <span>Question {currentQ + 1} of {questions.length}</span>
            <span>{Object.keys(answers).length} answered</span>
          </div>
          <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-card p-6 mb-4 hover-tilt glass-card-shine" style={{ animationDelay: '0.1s' }}>
          {question.bloom_level && (
            <span className="badge-amber mb-3 inline-block text-xs">{question.bloom_level}</span>
          )}
          <h3 className="text-lg font-medium text-white mb-5 leading-relaxed">{question.question}</h3>

          <div className="space-y-2.5 stagger-children">
            {question.options.map((option, i) => {
              const optionLetter = option.charAt(0);
              const isSelected = answers[question.id] === optionLetter;
              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(question.id, optionLetter)}
                  className={`w-full p-4 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-brand-600/15 border-brand-500/30 text-white'
                      : 'bg-surface-800/50 border-surface-700/30 text-surface-300 hover:border-surface-600 hover:bg-surface-800'
                  }`}
                >
                  <span className="text-sm">{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <div className="flex gap-1.5 stagger-children">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                  i === currentQ
                    ? 'bg-brand-600 text-white'
                    : answers[questions[i].id]
                    ? 'bg-brand-600/20 text-brand-400'
                    : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          {currentQ < questions.length - 1 ? (
            <button onClick={() => setCurrentQ(currentQ + 1)} className="btn-ghost flex items-center gap-1 group">
              Next <ChevronRight className="w-4 h-4 group-hover:animate-wiggle" />
            </button>
          ) : (
            <button
              onClick={submitQuiz}
              disabled={!answeredAll || loading}
              className="btn-primary flex items-center gap-2 sparkle-hover"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Submit
            </button>
          )}
        </div>
      </div>
    );
  }

  // ----- RESULTS STEP -----
  if (step === 'results' && results) {
    const scoreColor = results.score >= 80 ? 'text-emerald-400' : results.score >= 60 ? 'text-amber-400' : 'text-red-400';

    return (
      <div className="max-w-3xl mx-auto p-4 lg:p-8 animate-blur-in">
        {/* Score Card */}
        <div className="glass-card p-8 text-center mb-6 animate-scale-in-bounce glow-breathe gradient-border-animated" style={{ animationDelay: '0.05s' }}>
          <Trophy className={`w-14 h-14 ${scoreColor} mx-auto mb-4 animate-pop-in`} />
          <div className={`stat-value !text-5xl mb-2`} style={{ filter: `drop-shadow(0 0 12px ${results.score >= 80 ? 'rgba(52,211,153,0.4)' : results.score >= 60 ? 'rgba(251,191,36,0.4)' : 'rgba(248,113,113,0.4)'})` }}>{results.score}%</div>
          <p className="text-surface-300 mb-1">
            {results.correct} out of {results.total} correct
          </p>
          <p className="text-xs text-surface-400">Time: {formatTime(results.time_taken_seconds)}</p>
          <p className="text-sm text-surface-300 mt-4 max-w-md mx-auto">{results.feedback}</p>
          <div className="glow-line mx-auto mt-6 w-32" />
        </div>

        {/* Detailed Results */}
        <h3 className="text-lg font-semibold text-white mb-4 animate-slide-up-spring" style={{ animationDelay: '0.1s' }}>Question Review</h3>
        <div className="space-y-3 mb-6 stagger-children">
          {results.results.map((r, i) => (
            <div key={i} className={`glass-card p-4 border-l-4 hover-tilt glass-card-shine ${r.is_correct ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
              <div className="flex items-start gap-3">
                {r.is_correct ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-white font-medium mb-2">Q{i + 1}. {r.question}</p>
                  
                  {/* Show all options with highlighting */}
                  {r.options && r.options.length > 0 ? (
                    <div className="space-y-1 mb-3">
                      {r.options.map((opt, j) => {
                        const letter = opt.charAt(0).toUpperCase();
                        const isUserAnswer = letter === (r.your_answer_letter || r.your_answer?.charAt(0))?.toUpperCase();
                        const isCorrectAnswer = letter === (r.correct_answer_letter || r.correct_answer?.charAt(0))?.toUpperCase();
                        let optClass = 'text-surface-400 bg-surface-800/30';
                        if (isCorrectAnswer) optClass = 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/30';
                        if (isUserAnswer && !isCorrectAnswer) optClass = 'text-red-300 bg-red-500/10 border border-red-500/30';
                        if (isUserAnswer && isCorrectAnswer) optClass = 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/30';
                        return (
                          <div key={j} className={`text-xs px-3 py-1.5 rounded-lg ${optClass}`}>
                            {opt}
                            {isUserAnswer && isCorrectAnswer && ' ✓ Your answer'}
                            {isUserAnswer && !isCorrectAnswer && ' ✗ Your answer'}
                            {!isUserAnswer && isCorrectAnswer && ' ✓ Correct answer'}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mb-2 text-xs">
                      <span className={r.is_correct ? 'badge-green' : 'badge-red'}>
                        Your answer: {r.your_answer}
                      </span>
                      {!r.is_correct && (
                        <span className="badge-green">Correct: {r.correct_answer}</span>
                      )}
                    </div>
                  )}
                  
                  {r.explanation && (
                    <div className="bg-surface-800/50 rounded-lg p-3 mt-2">
                      <p className="text-xs text-surface-300 leading-relaxed">
                        <span className="text-brand-400 font-medium">Explanation: </span>
                        {r.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 stagger-children" style={{ animationDelay: '0.15s' }}>
          <button onClick={resetQuiz} className="btn-secondary flex-1 flex items-center justify-center gap-2 group">
            <RotateCcw className="w-4 h-4 group-hover:animate-wiggle" /> New Quiz
          </button>
          <button onClick={() => { setSelectedTopic(selectedTopic); resetQuiz(); }} className="btn-primary flex-1 flex items-center justify-center gap-2 sparkle-hover group">
            <ArrowRight className="w-4 h-4 group-hover:animate-wiggle" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
}
