import { useState, useEffect } from 'react';
import { FileText, Sparkles, Loader2, Download, BookOpen, GraduationCap, ClipboardList, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api/client';

const REPORT_TYPES = [
  { value: 'summary', label: 'Summary', desc: 'Quick overview of key concepts', icon: <BookOpen className="w-4 h-4" /> },
  { value: 'detailed', label: 'Detailed', desc: 'In-depth comprehensive notes', icon: <FileText className="w-4 h-4" /> },
  { value: 'revision', label: 'Revision', desc: 'Bullet-point quick revision', icon: <ClipboardList className="w-4 h-4" /> },
  { value: 'exam_prep', label: 'Exam Prep', desc: 'Exam-focused with practice Qs', icon: <Target className="w-4 h-4" /> },
];

export default function ReportPage() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [reportType, setReportType] = useState('summary');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load topics
  useEffect(() => {
    api.get('/report/topics')
      .then(res => setTopics(res.data))
      .catch(() => {
        setTopics([
          { id: 'mol_bio_101', name: 'Molecular Biology Fundamentals', difficulty: 'beginner', subtopics: ['DNA Structure and Replication', 'RNA Types and Transcription', 'Protein Synthesis'] },
          { id: 'gen_eng_201', name: 'Genetic Engineering', difficulty: 'intermediate', subtopics: ['CRISPR-Cas9', 'PCR', 'Molecular Cloning'] },
          { id: 'bioinfo_301', name: 'Bioinformatics', difficulty: 'intermediate', subtopics: ['Sequence Analysis', 'Genomics'] },
          { id: 'bpe_401', name: 'Bioprocess Engineering', difficulty: 'advanced', subtopics: ['Fermentation', 'Downstream Processing'] },
          { id: 'imm_vax_501', name: 'Immunology and Vaccines', difficulty: 'advanced', subtopics: ['Immune System', 'Vaccines', 'CAR-T'] },
          { id: 'ind_bio_601', name: 'Industrial Biotechnology', difficulty: 'intermediate', subtopics: ['Enzymes', 'Metabolic Engineering'] },
        ]);
      });
  }, []);

  const currentTopic = topics.find(t => t.name === selectedTopic);

  const handleGenerate = async () => {
    if (!selectedTopic) return;
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/report/generate', {
        topic: selectedTopic,
        subtopic: selectedSubtopic,
        report_type: reportType,
      });
      setResult(res.data);
    } catch (err) {
      console.error('Report generation error:', err);
      setError('Failed to generate the summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = async () => {
    if (result?.report) {
      try {
        await navigator.clipboard.writeText(result.report);
      } catch { /* ignore */ }
    }
  };

  const handleNewReport = () => {
    setResult(null);
    setError('');
  };

  // ---- RESULTS VIEW ----
  if (result) {
    return (
      <div className="max-w-4xl mx-auto p-4 lg:p-8 animate-blur-in">
        {/* Result Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge-green">{result.report_type || reportType}</span>
            <span className="badge-blue">{result.topic}</span>
            {result.subtopic && <span className="badge-purple">{result.subtopic}</span>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyResult}
              className="btn-ghost text-xs flex items-center gap-1.5 px-3 py-1.5"
              title="Copy to clipboard"
            >
              <Download className="w-3.5 h-3.5" /> Copy
            </button>
          </div>
        </div>

        {/* Summary Content */}
        <div className="glass-card glow-breathe p-6 mb-6 corner-accents">
          <div className="markdown-content prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{result.report}</ReactMarkdown>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleNewReport}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            ← New Report
          </button>
          <button
            onClick={() => {
              const types = ['summary', 'detailed', 'revision', 'exam_prep'];
              const currentIdx = types.indexOf(reportType);
              const nextType = types[(currentIdx + 1) % types.length];
              setReportType(nextType);
              setResult(null);
              setTimeout(() => handleGenerate(), 100);
            }}
            className="btn-primary sparkle-hover flex-1 flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 group-hover:animate-wiggle" /> Try Different Style
          </button>
        </div>
      </div>
    );
  }

  // ---- INPUT VIEW ----
  return (
    <div className="max-w-3xl mx-auto p-4 lg:p-8 animate-blur-in">
      {/* Header */}
      <div className="text-center mb-8 animate-slide-up-spring" style={{ animationDelay: '0.05s' }}>
        <div className="w-14 h-14 bg-brand-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pop-in gradient-border-animated">
          <GraduationCap className="w-7 h-7 text-brand-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 neon-text">Summary Generator</h1>
        <p className="text-surface-400">
          Select a topic and get a concise, well-organized study summary
        </p>
        <div className="glow-line mx-auto mt-4 w-24" />
      </div>

      {/* Topic Selection */}
      <div className="glass-card hover-tilt glass-card-shine p-6 mb-4">
        <h2 className="text-sm font-semibold text-white mb-3">Select Topic</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 stagger-children">
          {topics.map(topic => (
            <button
              key={topic.id}
              onClick={() => { setSelectedTopic(topic.name); setSelectedSubtopic(''); }}
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

      {/* Subtopic Selection (if topic selected) */}
      {currentTopic && currentTopic.subtopics?.length > 0 && (
        <div className="glass-card hover-tilt glass-card-shine p-6 mb-4">
          <h2 className="text-sm font-semibold text-white mb-2">
            Focus on Subtopic <span className="text-surface-500 font-normal">(optional)</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubtopic('')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                !selectedSubtopic
                  ? 'bg-brand-600/15 border-brand-500/30 text-brand-400'
                  : 'bg-surface-800/50 border-surface-700/50 text-surface-300 hover:border-surface-600'
              }`}
            >
              All Subtopics
            </button>
            {currentTopic.subtopics.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubtopic(sub)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                  selectedSubtopic === sub
                    ? 'bg-brand-600/15 border-brand-500/30 text-brand-400'
                    : 'bg-surface-800/50 border-surface-700/50 text-surface-300 hover:border-surface-600'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Report Type */}
      <div className="glass-card hover-tilt glass-card-shine p-6 mb-6">
        <h2 className="text-sm font-semibold text-white mb-3">Report Style</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 stagger-children">
          {REPORT_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => setReportType(type.value)}
              className={`p-3 rounded-xl text-center transition-all border ${
                reportType === type.value
                  ? 'bg-brand-600/15 border-brand-500/30'
                  : 'bg-surface-800/50 border-surface-700/50 hover:border-surface-600'
              }`}
            >
              <div className={`flex justify-center mb-1.5 ${reportType === type.value ? 'text-brand-400' : 'text-surface-400'}`}>
                {type.icon}
              </div>
              <span className={`text-sm font-medium block ${reportType === type.value ? 'text-white' : 'text-surface-300'}`}>
                {type.label}
              </span>
              <span className="text-xs text-surface-400 block mt-0.5">{type.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!selectedTopic || loading}
        className="btn-primary sparkle-hover w-full flex items-center justify-center gap-2 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Generating Summary...</>
        ) : (
          <><Sparkles className="w-5 h-5 group-hover:animate-wiggle" /> Generate Summary</>
        )}
      </button>
    </div>
  );
}
