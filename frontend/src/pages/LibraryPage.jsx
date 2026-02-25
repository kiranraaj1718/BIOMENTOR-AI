import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../api/client';
import {
  BookOpen, Search, Dna, Beaker, Zap, Shield, Atom, FlaskConical,
  ChevronRight, ArrowRight, Clock, Star, Tag, Sparkles, X
} from 'lucide-react';

const TOPIC_ICONS = {
  'Molecular Biology Fundamentals': Dna,
  'Genetic Engineering': Beaker,
  'Bioinformatics': Zap,
  'Bioprocess Engineering': Atom,
  'Immunology and Vaccines': Shield,
  'Industrial Biotechnology': FlaskConical,
};

const TOPIC_COLORS = {
  'Molecular Biology Fundamentals': { bg: 'bg-accent-teal/10', text: 'text-accent-teal', border: 'border-accent-teal/20', glow: 'hover:shadow-glow-teal' },
  'Genetic Engineering': { bg: 'bg-accent-sky/10', text: 'text-accent-sky', border: 'border-accent-sky/20', glow: 'hover:shadow-glow-blue' },
  'Bioinformatics': { bg: 'bg-accent-violet/10', text: 'text-accent-violet', border: 'border-accent-violet/20', glow: 'hover:shadow-glow-purple' },
  'Bioprocess Engineering': { bg: 'bg-accent-amber/10', text: 'text-accent-amber', border: 'border-accent-amber/20', glow: 'hover:shadow-glow-sm' },
  'Immunology and Vaccines': { bg: 'bg-accent-rose/10', text: 'text-accent-rose', border: 'border-accent-rose/20', glow: 'hover:shadow-glow-rose' },
  'Industrial Biotechnology': { bg: 'bg-accent-mint/10', text: 'text-accent-mint', border: 'border-accent-mint/20', glow: 'hover:shadow-glow-sm' },
};

const READING_TIME = {
  beginner: '8-12 min',
  intermediate: '15-20 min',
  advanced: '20-30 min',
};

const DIFFICULTY_BADGE = {
  beginner: 'badge-green',
  intermediate: 'badge-blue',
  advanced: 'badge-purple',
};

export default function LibraryPage() {
  const [topics, setTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [content, setContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  useEffect(() => {
    api.get('/curriculum')
      .then(res => setTopics(res.data.topics || []))
      .catch(() => {
        // Fallback topics
        setTopics([
          { id: 'mol_bio_101', name: 'Molecular Biology Fundamentals', difficulty: 'beginner', description: 'Core concepts of molecular biology essential for biotechnology', subtopics: ['DNA Structure and Replication', 'RNA Types and Transcription', 'Protein Synthesis and Translation', 'Gene Expression Regulation', 'Central Dogma of Molecular Biology'] },
          { id: 'gen_eng_201', name: 'Genetic Engineering', difficulty: 'intermediate', description: 'Techniques for modifying DNA including CRISPR, PCR, and cloning', subtopics: ['CRISPR-Cas9 Gene Editing', 'Polymerase Chain Reaction (PCR)', 'Molecular Cloning', 'Gene Therapy', 'Transgenic Organisms'] },
          { id: 'bioinfo_301', name: 'Bioinformatics', difficulty: 'intermediate', description: 'Computational tools for biological data analysis', subtopics: ['Sequence Analysis', 'Genomics and Proteomics', 'Phylogenetic Analysis', 'Structural Bioinformatics'] },
          { id: 'bpe_401', name: 'Bioprocess Engineering', difficulty: 'advanced', description: 'Design and optimization of biological production processes', subtopics: ['Fermentation Technology', 'Downstream Processing', 'Bioreactor Design', 'Scale-up Principles'] },
          { id: 'imm_vax_501', name: 'Immunology and Vaccines', difficulty: 'advanced', description: 'Immune system mechanisms and vaccine development', subtopics: ['Innate and Adaptive Immunity', 'Vaccine Development', 'mRNA Vaccine Technology', 'CAR-T Cell Therapy', 'Monoclonal Antibodies'] },
          { id: 'ind_bio_601', name: 'Industrial Biotechnology', difficulty: 'intermediate', description: 'Application of biological systems in industrial processes', subtopics: ['Industrial Enzymes', 'Metabolic Engineering', 'Biofuels', 'Bioplastics and Biomaterials'] },
        ]);
      });
  }, []);

  const loadSubtopicContent = async (topic, subtopic) => {
    setLoadingContent(true);
    setContent(null);
    try {
      const res = await api.post('/report/generate', {
        topic: topic.name,
        subtopic: subtopic,
        report_type: 'detailed',
      });
      setContent(res.data.report);
    } catch {
      setContent(`## ${subtopic}\n\nContent for "${subtopic}" under ${topic.name} is being prepared. Use the **AI Tutor Chat** to ask questions about this topic in the meantime.`);
    } finally {
      setLoadingContent(false);
    }
  };

  const filteredTopics = topics.filter(t => {
    const matchesSearch = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subtopics?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty = filterDifficulty === 'all' || t.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const defaultColors = { bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/20', glow: 'hover:shadow-glow-sm' };

  // ── Reading view ──
  if (selectedSubtopic && selectedTopic) {
    return (
      <div className="max-w-4xl mx-auto p-4 lg:p-8 animate-blur-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6 flex-wrap">
          <button onClick={() => { setSelectedTopic(null); setSelectedSubtopic(null); setContent(null); }} className="text-surface-400 hover:text-white transition-colors">Library</button>
          <ChevronRight className="w-3.5 h-3.5 text-surface-500" />
          <button onClick={() => { setSelectedSubtopic(null); setContent(null); }} className="text-surface-400 hover:text-white transition-colors">{selectedTopic.name}</button>
          <ChevronRight className="w-3.5 h-3.5 text-surface-500" />
          <span className="text-white font-medium">{selectedSubtopic}</span>
        </div>

        {loadingContent ? (
          <div className="glass-card p-12 flex flex-col items-center justify-center">
            <div className="dna-loader mb-4"><span></span><span></span><span></span></div>
            <p className="text-surface-400 text-sm">Loading study material...</p>
          </div>
        ) : content ? (
          <>
            <div className="glass-card p-6 lg:p-8 mb-6">
              <div className="markdown-content prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setSelectedSubtopic(null); setContent(null); }} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                ← Back to Topic
              </button>
              <Link to="/chat" className="btn-primary sparkle-hover flex-1 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> Ask AI Tutor
              </Link>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  // ── Topic detail view ──
  if (selectedTopic) {
    const colors = TOPIC_COLORS[selectedTopic.name] || defaultColors;
    const Icon = TOPIC_ICONS[selectedTopic.name] || BookOpen;
    return (
      <div className="max-w-4xl mx-auto p-4 lg:p-8 animate-blur-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button onClick={() => setSelectedTopic(null)} className="text-surface-400 hover:text-white transition-colors">Library</button>
          <ChevronRight className="w-3.5 h-3.5 text-surface-500" />
          <span className="text-white font-medium">{selectedTopic.name}</span>
        </div>

        {/* Topic header */}
        <div className="glass-card p-6 mb-6 relative overflow-hidden">
          <div className={`absolute -top-10 -right-10 w-32 h-32 ${colors.bg} rounded-full blur-3xl`} />
          <div className="relative flex items-start gap-4">
            <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center flex-shrink-0 border ${colors.border}`}>
              <Icon className={`w-7 h-7 ${colors.text}`} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-display font-bold text-white mb-1">{selectedTopic.name}</h1>
              <p className="text-sm text-surface-400 mb-3">{selectedTopic.description}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={DIFFICULTY_BADGE[selectedTopic.difficulty] || 'badge-blue'}>{selectedTopic.difficulty}</span>
                <span className="text-xs text-surface-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {READING_TIME[selectedTopic.difficulty] || '15 min'} per topic
                </span>
                <span className="text-xs text-surface-400 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {selectedTopic.subtopics?.length || 0} subtopics
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtopics list */}
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-3">Study Materials</h2>
        <div className="space-y-2 mb-6">
          {selectedTopic.subtopics?.map((sub, i) => (
            <button
              key={sub}
              onClick={() => { setSelectedSubtopic(sub); loadSubtopicContent(selectedTopic, sub); }}
              className="w-full glass-card-hover p-4 flex items-center gap-4 text-left group animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0 border ${colors.border} group-hover:scale-110 transition-transform`}>
                <span className={`text-sm font-bold ${colors.text}`}>{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors block">{sub}</span>
                <span className="text-xs text-surface-500">Click to read study material</span>
              </div>
              <ArrowRight className="w-4 h-4 text-surface-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => setSelectedTopic(null)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            ← Back to Library
          </button>
          <Link to={`/quiz`} className="btn-primary sparkle-hover flex-1 flex items-center justify-center gap-2">
            <Star className="w-4 h-4" /> Quiz on this Topic
          </Link>
        </div>
      </div>
    );
  }

  // ── Library browse view ──
  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8 animate-blur-in">
      {/* Header */}
      <div className="text-center mb-8 animate-slide-up-spring" style={{ animationDelay: '0.05s' }}>
        <div className="w-14 h-14 bg-gradient-to-br from-accent-indigo/20 to-accent-violet/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent-indigo/15">
          <BookOpen className="w-7 h-7 text-accent-indigo" />
        </div>
        <h1 className="text-2xl font-display font-bold text-white mb-2">Study Library</h1>
        <p className="text-surface-400 max-w-lg mx-auto">
          Browse structured biotechnology study materials organized by topic and difficulty
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics, subtopics..."
            className="input-field pl-10 !py-2.5"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {['all', 'beginner', 'intermediate', 'advanced'].map(d => (
            <button
              key={d}
              onClick={() => setFilterDifficulty(d)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                filterDifficulty === d
                  ? 'bg-brand-600/15 border-brand-500/30 text-brand-400'
                  : 'bg-surface-800/50 border-surface-700/50 text-surface-400 hover:text-white hover:border-surface-600'
              }`}
            >
              {d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Topics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {filteredTopics.map((topic, i) => {
          const colors = TOPIC_COLORS[topic.name] || defaultColors;
          const Icon = TOPIC_ICONS[topic.name] || BookOpen;
          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className={`glass-card-hover hover-tilt glass-card-shine p-5 text-left group hover-lift ${colors.glow} animate-fade-in-up`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-11 h-11 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0 border ${colors.border} group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-display font-semibold text-white group-hover:text-brand-300 transition-colors leading-tight">{topic.name}</h3>
                  <span className={`${DIFFICULTY_BADGE[topic.difficulty] || 'badge-blue'} mt-1.5 inline-block`}>{topic.difficulty}</span>
                </div>
              </div>
              <p className="text-xs text-surface-400 leading-relaxed mb-3 line-clamp-2">{topic.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-surface-500">{topic.subtopics?.length || 0} topics &bull; {READING_TIME[topic.difficulty] || '15 min'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-surface-500 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          );
        })}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-10 h-10 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-400">No topics match your search.</p>
        </div>
      )}
    </div>
  );
}
