import { Link } from 'react-router-dom';
import { MessageSquare, Brain, BarChart3, Route, Dna, Sparkles, BookOpen, Beaker, Shield, Zap, ArrowRight, Play, ChevronRight, Atom, FileText, Library, TrendingUp, GitBranch, AlertOctagon, Timer, Map, Star, Award, Rocket, Crown } from 'lucide-react';
import DNAHelix from '../components/DNAHelix';
import SectionDivider from '../components/SectionDivider';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Tutor Chat',
    description: 'Ask any biotechnology question. Get detailed, curriculum-aligned answers powered by RAG.',
    link: '/chat',
    gradient: 'from-amber-400 to-yellow-300',
    glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(251,191,36,0.3)]',
    iconBg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
  },
  {
    icon: Brain,
    title: 'Adaptive Quiz',
    description: 'AI-generated quizzes that adapt to your skill level with detailed explanations.',
    link: '/quiz',
    gradient: 'from-blue-500 to-cyan-400',
    glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(56,189,248,0.3)]',
    iconBg: 'bg-sky-500/10 group-hover:bg-sky-500/20',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description: 'Track progress with score trends, mastery radar charts, and topic breakdowns.',
    link: '/dashboard',
    gradient: 'from-purple-500 to-pink-400',
    glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(192,132,252,0.3)]',
    iconBg: 'bg-purple-500/10 group-hover:bg-purple-500/20',
  },
  {
    icon: Route,
    title: 'Learning Path',
    description: 'Personalized study plan with AI-powered recommendations and gap analysis.',
    link: '/learning-path',
    gradient: 'from-amber-500 to-orange-400',
    glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(251,191,36,0.3)]',
    iconBg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
  },
  {
    icon: BookOpen,
    title: 'Study Library',
    description: 'Browse curated reading materials organized by topic and difficulty level.',
    link: '/library',
    gradient: 'from-indigo-500 to-violet-400',
    glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(129,140,248,0.3)]',
    iconBg: 'bg-indigo-500/10 group-hover:bg-indigo-500/20',
  },
  {
    icon: FileText,
    title: 'Summary',
    description: 'Generate detailed summaries with revision notes and exam prep.',
    link: '/report',
    gradient: 'from-rose-500 to-pink-400',
    glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(244,63,94,0.3)]',
    iconBg: 'bg-rose-500/10 group-hover:bg-rose-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Exam Predictor',
    description: 'AI predicts your exam success probability and highlights areas to improve.',
    link: '/exam-predictor',
    gradient: 'from-yellow-500 to-amber-400',
    glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]',
    iconBg: 'bg-yellow-500/10 group-hover:bg-yellow-500/20',
  },
  {
    icon: GitBranch,
    title: 'Diagram Creator',
    description: 'Instantly generate flowcharts, mind maps, and diagrams for any biotech concept.',
    link: '/diagram',
    gradient: 'from-sky-500 to-blue-400',
    glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(14,165,233,0.3)]',
    iconBg: 'bg-sky-500/10 group-hover:bg-sky-500/20',
  },
  {
    icon: AlertOctagon,
    title: 'Mistake Analyzer',
    description: 'Identify patterns in your quiz mistakes and get targeted improvement strategies.',
    link: '/mistakes',
    gradient: 'from-red-500 to-rose-400',
    glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)]',
    iconBg: 'bg-red-500/10 group-hover:bg-red-500/20',
  },
  {
    icon: Timer,
    title: '5-Min Revision',
    description: 'Quick revision sessions with flash cards, mnemonics, and mini-quizzes.',
    link: '/revision',
    gradient: 'from-orange-500 to-amber-400',
    glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(249,115,22,0.3)]',
    iconBg: 'bg-orange-500/10 group-hover:bg-orange-500/20',
  },
  {
    icon: Map,
    title: 'Study Roadmap',
    description: 'Personalized multi-week study plans tailored to your progress and goals.',
    link: '/roadmap',
    gradient: 'from-violet-500 to-indigo-400',
    glow: 'group-hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]',
    iconBg: 'bg-violet-500/10 group-hover:bg-violet-500/20',
  },
];

const topics = [
  { name: 'Molecular Biology', icon: Dna, desc: 'DNA, RNA, proteins, gene expression', color: 'text-amber-400' },
  { name: 'Genetic Engineering', icon: Beaker, desc: 'CRISPR, PCR, gene therapy, cloning', color: 'text-sky-400' },
  { name: 'Bioinformatics', icon: Zap, desc: 'Sequence analysis, genomics, proteomics', color: 'text-purple-400' },
  { name: 'Bioprocess Engineering', icon: Atom, desc: 'Fermentation, DSP, bioreactors', color: 'text-amber-400' },
  { name: 'Immunology & Vaccines', icon: Shield, desc: 'Immunity, mRNA vaccines, CAR-T', color: 'text-rose-400' },
  { name: 'Industrial Biotech', icon: Beaker, desc: 'Enzymes, metabolic engineering, biofuels', color: 'text-cyan-400' },
];

const techStack = [
  { title: 'RAG Pipeline', desc: 'Answers grounded in verified curriculum content with vector similarity search and ChromaDB.', icon: '🔬' },
  { title: 'Adaptive Learning', desc: 'Quiz difficulty and recommendations dynamically adjust based on mastery analytics.', icon: '🧠' },
  { title: 'Async Backend', desc: 'FastAPI with async SQLAlchemy, modular services, and production-ready architecture.', icon: '⚡' },
];

export default function HomePage() {
  return (
    <div className="min-h-full">
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden px-4 lg:px-8 pt-20 pb-24">
        {/* Background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-brand-500/[0.08] via-brand-500/[0.03] to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-[10%] w-[300px] h-[300px] bg-gradient-radial from-amber-500/[0.05] to-transparent rounded-full blur-3xl pointer-events-none animate-float" />
        <div className="absolute top-40 left-[5%] w-[250px] h-[250px] bg-gradient-radial from-yellow-500/[0.05] to-transparent rounded-full blur-3xl pointer-events-none animate-float-delayed" />
        {/* Morphing blobs */}
        <div className="absolute top-32 right-[8%] w-[180px] h-[180px] bg-brand-500/[0.04] morph-blob pointer-events-none" />
        <div className="absolute bottom-10 left-[12%] w-[140px] h-[140px] bg-sky-500/[0.03] morph-blob pointer-events-none" style={{ animationDelay: '4s' }} />
        {/* Spinning accent rings */}
        <div className="absolute top-10 right-[20%] w-[120px] h-[120px] border border-brand-500/[0.08] rounded-full animate-spin-slow pointer-events-none" />
        <div className="absolute bottom-20 left-[15%] w-[80px] h-[80px] border border-brand-400/[0.1] rounded-full animate-counter-spin pointer-events-none" />
        <div className="absolute top-1/2 right-[5%] w-[60px] h-[60px] border border-sky-400/[0.06] rounded-full animate-spin-slow pointer-events-none" style={{ animationDirection: 'reverse' }} />
        {/* Decorative DNA helix on the side */}
        <div className="absolute top-10 left-0 opacity-30 pointer-events-none hidden lg:block">
          <DNAHelix height={500} />
        </div>
        <div className="absolute top-20 right-0 opacity-20 pointer-events-none hidden lg:block" style={{ transform: 'scaleX(-1)' }}>
          <DNAHelix height={400} />
        </div>
        {/* Decorative floating icons */}
        <div className="absolute top-[15%] left-[8%] text-brand-400/10 animate-float pointer-events-none hidden lg:block">
          <Atom className="w-12 h-12" />
        </div>
        <div className="absolute top-[60%] right-[6%] text-sky-400/10 animate-float-delayed pointer-events-none hidden lg:block">
          <Beaker className="w-10 h-10" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 glass-card gradient-border-animated rounded-full animate-blur-in">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-400/30 rounded-full blur-sm animate-glow-pulse" />
              <Sparkles className="relative w-4 h-4 text-brand-400 animate-wiggle" />
            </div>
            <span className="text-sm font-medium text-brand-300">AI-Powered Biotechnology Education</span>
            <ChevronRight className="w-3.5 h-3.5 text-brand-500 bounce-arrow" />
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-white leading-[1.08] tracking-tight animate-slide-up-spring">
            Master Biotechnology{' '}
            <br className="hidden sm:block" />
            with{' '}
            <span className="text-shimmer neon-text">
              BioMentor AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-surface-300 max-w-2xl mx-auto leading-relaxed animate-blur-in" style={{ animationDelay: '0.15s' }}>
            Your intelligent tutoring companion. Get accurate answers, adaptive quizzes, and
            personalized learning paths — all powered by{' '}
            <span className="text-brand-400 font-medium neon-text">LLM + RAG</span>.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 animate-blur-in" style={{ animationDelay: '0.2s' }}>
            {[
              { icon: Rocket, text: 'Instant AI Answers' },
              { icon: Crown, text: 'Curriculum Aligned' },
              { icon: Award, text: 'Adaptive Learning' },
            ].map((badge) => (
              <div key={badge.text} className="fancy-chip">
                <badge.icon className="w-3 h-3 text-brand-400" />
                <span className="text-brand-300">{badge.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 animate-slide-up-spring" style={{ animationDelay: '0.3s' }}>
            <Link to="/chat" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2.5 group sparkle-hover pulse-ring rounded-xl">
              <Play className="w-4 h-4 transition-transform group-hover:scale-110" />
              Start Learning
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/quiz" className="btn-secondary text-base px-8 py-3.5 flex items-center gap-2.5 group">
              <Brain className="w-4 h-4 group-hover:animate-wiggle" />
              Take a Quiz
            </Link>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-14 stagger-children" style={{ animationDelay: '0.4s' }}>
            {[
              { value: '6', label: 'Topics' },
              { value: '25+', label: 'Subtopics' },
              { value: 'Gemini', label: 'Powered' },
              { value: 'RAG', label: 'Enhanced' },
            ].map((stat) => (
              <div key={stat.label} className="text-center group cursor-default">
                <div className="stat-value">{stat.value}</div>
                <div className="text-xs text-surface-500 font-medium mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── FEATURES GRID ── */}
      <section className="px-4 lg:px-8 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="badge-amber mb-4 inline-flex items-center gap-1.5">
              <Star className="w-3 h-3" />
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white neon-text">Everything You Need to Excel</h2>
            <p className="text-surface-400 mt-3 max-w-lg mx-auto">Powerful AI tools designed to accelerate your biotechnology learning journey.</p>
            {/* Decorative line under heading */}
            <div className="glow-line mx-auto mt-6 w-32" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {features.map((feature, i) => (
              <Link
                key={feature.title}
                to={feature.link}
                className={`group glass-card-hover glass-card-shine p-6 hover-tilt corner-accents ${feature.glow}`}
              >
                {/* Feature number badge */}
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <span className="text-[10px] font-bold text-surface-500">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:animate-scale-in-bounce icon-pulse`}>
                  <feature.icon className={`w-6 h-6 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`} style={{ color: undefined }}>
                  </feature.icon>
                  <feature.icon className={`w-6 h-6 text-white`} />
                </div>
                <h3 className="text-lg font-display font-semibold text-white mb-2 group-hover:text-brand-300 transition-colors hover-underline inline-block">{feature.title}</h3>
                <p className="text-sm text-surface-400 leading-relaxed mb-3">{feature.description}</p>
                <span className="inline-flex items-center text-sm text-brand-400 font-medium gap-1 group-hover:gap-2.5 transition-all">
                  Explore <ArrowRight className="w-3.5 h-3.5 bounce-arrow" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── CURRICULUM TOPICS ── */}
      <section className="px-4 lg:px-8 pb-24 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-brand-500/[0.03] to-transparent rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-14">
            <span className="badge-purple mb-4 inline-flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Comprehensive Curriculum
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">Biotechnology Topics Covered</h2>
            <p className="text-surface-400 mt-3 max-w-lg mx-auto">Expert-curated content spanning the full biotechnology curriculum.</p>
            <div className="glow-line mx-auto mt-6 w-32" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {topics.map((topic, i) => (
              <div
                key={topic.name}
                className="glass-card glass-card-shine p-5 flex items-start gap-3.5 hover-tilt corner-accents group"
              >
                <div className="w-11 h-11 glass-card rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform relative">
                  <topic.icon className={`w-5 h-5 ${topic.color}`} />
                  {/* Subtle glow behind icon */}
                  <div className={`absolute inset-0 rounded-xl ${topic.color} opacity-5 blur-sm group-hover:opacity-15 transition-opacity`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">{topic.name}</h3>
                  <p className="text-xs text-surface-400 mt-1 leading-relaxed">{topic.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── TECH ARCHITECTURE ── */}
      <section className="px-4 lg:px-8 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card p-8 lg:p-10 relative overflow-hidden gradient-border-animated glow-breathe animate-tilt-in">
            {/* Glow orbs */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-500/[0.05] rounded-full blur-3xl pointer-events-none morph-blob" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-500/[0.04] rounded-full blur-3xl pointer-events-none morph-blob" style={{ animationDelay: '3s' }} />
            {/* Hex pattern overlay */}
            <div className="absolute inset-0 hex-grid opacity-40 pointer-events-none rounded-2xl" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center relative">
                  <Zap className="w-5 h-5 text-brand-400" />
                  <div className="absolute inset-0 bg-brand-400/10 rounded-xl blur-md animate-glow-pulse" />
                </div>
                <h2 className="text-xl font-display font-bold text-white neon-text">Powered by Advanced AI</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
                {techStack.map((item) => (
                  <div key={item.title} className="p-5 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:border-brand-500/20 transition-all duration-300 hover-tilt sparkle-hover corner-accents">
                    <span className="text-3xl mb-3 block">{item.icon}</span>
                    <h3 className="text-sm font-semibold text-brand-400 mb-2">{item.title}</h3>
                    <p className="text-xs text-surface-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="px-4 lg:px-8 pb-20 relative">
        {/* Background glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-radial from-brand-500/[0.06] to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center space-y-6 relative">
          <div className="inline-flex items-center gap-1.5 mb-2">
            <div className="w-1 h-1 rounded-full bg-brand-400 animate-glow-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-glow-pulse" style={{ animationDelay: '0.3s' }} />
            <div className="w-1 h-1 rounded-full bg-brand-400 animate-glow-pulse" style={{ animationDelay: '0.6s' }} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">Ready to Start Learning?</h2>
          <p className="text-surface-400 max-w-xl mx-auto">Begin your biotechnology journey with AI-powered tutoring, adaptive assessments, and personalized guidance.</p>
          <Link to="/chat" className="btn-primary text-base px-10 py-3.5 inline-flex items-center gap-2.5 group sparkle-hover pulse-ring rounded-xl animate-pop-in" style={{ animationDelay: '0.2s' }}>
            <MessageSquare className="w-5 h-5 group-hover:animate-wiggle" />
            Chat with AI Tutor
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 bounce-arrow" />
          </Link>
        </div>

        {/* Decorative bottom glow line */}
        <div className="glow-line mx-auto mt-16 w-48" />
      </section>
    </div>
  );
}
