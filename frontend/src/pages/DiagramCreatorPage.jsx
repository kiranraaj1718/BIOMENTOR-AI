import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { featuresAPI } from '../api/client';
import {
  GitBranch, Sparkles, ArrowRight, Loader2, RefreshCw,
  BookOpen, Lightbulb, Copy, CheckCircle2, AlertCircle
} from 'lucide-react';

const DIAGRAM_TYPES = [
  { value: 'flowchart', label: 'Flowchart', desc: 'Step-by-step process or pathway' },
  { value: 'mindmap', label: 'Mind Map', desc: 'Concept branches and relationships' },
  { value: 'cycle', label: 'Cycle', desc: 'Cyclical or repeating processes' },
  { value: 'comparison', label: 'Comparison', desc: 'Side-by-side concept comparison' },
  { value: 'hierarchy', label: 'Hierarchy', desc: 'Classification or structure tree' },
];

const QUICK_TOPICS = [
  'DNA Replication', 'Protein Synthesis', 'CRISPR-Cas9 Mechanism',
  'PCR Steps', 'mRNA Vaccine Production', 'Fed-Batch Fermentation',
  'Immune Response Pathway', 'Gene Cloning Process',
];

export default function DiagramCreatorPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [topic, setTopic] = useState('');
  const [diagramType, setDiagramType] = useState('flowchart');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!topic.trim()) { setError('Please enter a topic'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await featuresAPI.createDiagram({ topic: topic.trim(), diagram_type: diagramType });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate diagram');
    } finally {
      setLoading(false);
    }
  };

  const copyMermaid = () => {
    if (result?.mermaid_code) {
      navigator.clipboard.writeText(result.mermaid_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-4 lg:p-8 animate-fade-in text-center mt-20">
        <div className="w-16 h-16 bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <GitBranch className="w-8 h-8 text-surface-500" />
        </div>
        <h2 className="text-xl font-display font-bold text-white mb-2">Sign In Required</h2>
        <p className="text-surface-400 text-sm mb-6">Sign in to create diagrams.</p>
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
          <div className="w-10 h-10 bg-gradient-to-br from-accent-sky/20 to-blue-500/20 rounded-xl flex items-center justify-center animate-pop-in gradient-border-animated">
            <GitBranch className="w-5 h-5 text-accent-sky" />
          </div>
          Instant Diagram Creator
        </h1>
        <p className="text-sm text-surface-400 mt-2 ml-[52px]">Generate visual diagrams for any biotech concept using AI</p>
        <div className="glow-line mt-4 w-24 ml-[52px]" />
      </div>

      {/* Input */}
      <div className="glass-card hover-tilt glass-card-shine p-6 mb-4">
        <div className="space-y-4">
          {/* Topic input */}
          <div>
            <label className="block text-xs font-semibold text-surface-400 mb-1.5 uppercase tracking-wider">Topic</label>
            <input
              type="text" value={topic} onChange={e => setTopic(e.target.value)}
              placeholder="e.g. DNA Replication, CRISPR mechanism..."
              className="input-field"
              onKeyDown={e => e.key === 'Enter' && generate()}
            />
          </div>

          {/* Quick topics */}
          <div>
            <p className="text-[10px] text-surface-500 uppercase tracking-wider mb-2">Quick Select</p>
            <div className="flex flex-wrap gap-1.5 stagger-children">
              {QUICK_TOPICS.map(t => (
                <button key={t} onClick={() => setTopic(t)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${topic === t ? 'border-brand-500/40 bg-brand-500/10 text-brand-400' : 'border-white/[0.06] text-surface-400 hover:text-white hover:border-white/[0.1]'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Diagram type */}
          <div>
            <label className="block text-xs font-semibold text-surface-400 mb-1.5 uppercase tracking-wider">Diagram Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 stagger-children">
              {DIAGRAM_TYPES.map(dt => (
                <button key={dt.value} onClick={() => setDiagramType(dt.value)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${diagramType === dt.value ? 'border-brand-500/40 bg-brand-500/10' : 'border-white/[0.06] bg-surface-800/40 hover:border-white/[0.1]'}`}>
                  <p className={`text-xs font-semibold ${diagramType === dt.value ? 'text-brand-400' : 'text-surface-200'}`}>{dt.label}</p>
                  <p className="text-[10px] text-surface-500 mt-0.5">{dt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}

          <button onClick={generate} disabled={loading} className="btn-primary sparkle-hover w-full flex items-center justify-center gap-2 py-2.5 group">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating diagram...</> : <><GitBranch className="w-4 h-4 group-hover:animate-wiggle" /> Generate Diagram</>}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-fade-in-up stagger-children">
          {/* Title & Description */}
          <div className="glass-card glow-breathe p-5 corner-accents">
            <h2 className="text-lg font-display font-semibold text-white mb-2">{result.title}</h2>
            <p className="text-sm text-surface-400">{result.description}</p>
          </div>

          {/* Mermaid Code */}
          <div className="glass-card hover-tilt glass-card-shine p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Mermaid Diagram Code</h3>
              <button onClick={copyMermaid} className="btn-ghost text-xs flex items-center gap-1.5">
                {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
            <pre className="bg-surface-900/60 border border-white/[0.06] rounded-xl p-4 text-xs text-surface-300 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
              {result.mermaid_code}
            </pre>
            <p className="text-[10px] text-surface-500 mt-2">
              Paste this code in <a href="https://mermaid.live" target="_blank" rel="noreferrer" className="text-brand-400 hover:underline">mermaid.live</a> to view the rendered diagram.
            </p>
          </div>

          {/* Key Concepts */}
          {result.key_concepts?.length > 0 && (
            <div className="glass-card hover-tilt glass-card-shine p-5">
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-accent-amber" /> Key Concepts
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.key_concepts.map((c, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-surface-800/60 border border-white/[0.06] text-surface-300">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Study Notes */}
          {result.study_notes && (
            <div className="glass-card hover-tilt glass-card-shine p-5">
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-accent-teal" /> Study Notes
              </h3>
              <p className="text-sm text-surface-300 leading-relaxed">{result.study_notes}</p>
            </div>
          )}

          {/* Regenerate */}
          <div className="text-center pt-2">
            <button onClick={generate} disabled={loading} className="btn-secondary inline-flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
