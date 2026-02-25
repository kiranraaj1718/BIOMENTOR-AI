import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { chatAPI } from '../api/client';
import {
  Send, Bot, User, Sparkles, BookOpen, Loader2, AlertCircle, MessageSquare,
  Zap, ArrowRight, Mic, MicOff, Paperclip, X, FileText, Image as ImageIcon
} from 'lucide-react';

// ── Voice recognition hook ──
function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          final += event.results[i][0].transcript;
        }
        setTranscript(final);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, transcript, supported, startListening, stopListening };
}

// ── File attachment pill ──
function AttachmentPill({ file, onRemove }) {
  const isImage = file.type.startsWith('image/');
  return (
    <div className="flex items-center gap-2 bg-surface-800/80 border border-white/[0.08] rounded-xl px-3 py-2 text-xs animate-scale-in">
      {isImage ? (
        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
          <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-lg bg-accent-indigo/15 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-accent-indigo" />
        </div>
      )}
      <span className="text-surface-300 truncate max-w-[140px]">{file.name}</span>
      <span className="text-surface-500">{(file.size / 1024).toFixed(0)}KB</span>
      <button onClick={onRemove} className="ml-1 p-0.5 hover:bg-white/10 rounded-md transition-colors">
        <X className="w-3 h-3 text-surface-400" />
      </button>
    </div>
  );
}

const SUGGESTED_QUESTIONS = [
  { text: "Explain the CRISPR-Cas9 mechanism and its applications in gene therapy", icon: "🧬" },
  { text: "How does PCR work? Describe the steps and key enzymes involved", icon: "🔬" },
  { text: "What are the differences between innate and adaptive immunity?", icon: "🛡️" },
  { text: "Explain mRNA vaccine technology and how it was used for COVID-19", icon: "💉" },
  { text: "Describe the process of recombinant protein production in E. coli", icon: "🦠" },
  { text: "What is the Michaelis-Menten equation and how is it used in enzyme kinetics?", icon: "⚗️" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const { isListening, transcript, supported: voiceSupported, startListening, stopListening } = useVoiceRecognition();

  // Sync voice transcript into input
  useEffect(() => {
    if (transcript) setInput(prev => prev + transcript);
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Read file content as text
  const readFileAsText = (file) => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        resolve(`[Attached image: ${file.name}]`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve(`[Could not read file: ${file.name}]`);
      reader.readAsText(file);
    });
  };

  const sendMessage = async (text = null) => {
    const messageText = text || input.trim();
    if (!messageText && attachedFiles.length === 0) return;
    if (loading) return;

    let fullMessage = messageText;
    if (attachedFiles.length > 0) {
      const fileContents = await Promise.all(attachedFiles.map(readFileAsText));
      const fileContext = fileContents.map((content, i) =>
        `\n\n--- Attached file: ${attachedFiles[i].name} ---\n${content}`
      ).join('');
      fullMessage = messageText + fileContext;
    }

    setInput('');
    setError(null);

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      attachments: attachedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setAttachedFiles([]);
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage({
        message: fullMessage,
        session_id: sessionId,
      });
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.response,
        sources: res.data.sources || [],
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      if (res.data.session_id) setSessionId(res.data.session_id);
    } catch (err) {
      setError('Failed to get response. Make sure the backend server is running.');
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '⚠️ I couldn\'t connect to the server. Please make sure the backend is running.',
        sources: [],
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
    setAttachedFiles([]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024);
    setAttachedFiles(prev => [...prev, ...validFiles].slice(0, 3));
    e.target.value = '';
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Welcome screen */
          <div className="flex flex-col items-center justify-center min-h-full p-6 relative z-10">
            <div className="absolute top-10 left-[15%] w-48 h-48 bg-gradient-radial from-accent-teal/[0.05] to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-[15%] w-40 h-40 bg-gradient-radial from-accent-violet/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-2xl w-full text-center relative z-10">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-accent-teal/20 to-accent-indigo/10 rounded-2xl blur-xl" />
                <div className="relative w-18 h-18 glass-card flex items-center justify-center !rounded-2xl">
                  <Bot className="w-9 h-9 text-accent-teal" />
                </div>
              </div>

              <h2 className="text-3xl font-display font-bold text-white mb-3">
                Ask BioMentor AI
              </h2>
              <p className="text-surface-400 mb-8 max-w-lg mx-auto leading-relaxed">
                Your AI biotechnology tutor. Ask questions, attach study materials,
                or use <span className="text-accent-rose font-medium">voice search</span> for hands-free learning.
              </p>

              {/* Feature chips */}
              <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-teal/10 border border-accent-teal/20 text-xs text-accent-teal">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-teal" /> RAG-Powered
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-indigo/10 border border-accent-indigo/20 text-xs text-accent-indigo">
                  <Paperclip className="w-3 h-3" /> File Attachments
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-rose/10 border border-accent-rose/20 text-xs text-accent-rose">
                  <Mic className="w-3 h-3" /> Voice Search
                </div>
              </div>

              {/* Suggested questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q.text)}
                    className="relative z-10 bg-surface-800/50 border border-white/[0.06] rounded-2xl group p-4 text-left cursor-pointer hover:bg-surface-800/70 hover:border-brand-500/20 hover:shadow-glow-sm active:scale-[0.98] transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0">{q.icon}</span>
                      <p className="text-sm text-surface-300 group-hover:text-white transition-colors leading-relaxed">{q.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-2.5 text-xs text-brand-400/60 group-hover:text-brand-400 transition-colors">
                      <Zap className="w-3 h-3" /> Ask this
                      <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Messages list */
          <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 animate-fade-in-up ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="relative flex-shrink-0 mt-1">
                    <div className="absolute inset-0 bg-accent-teal/20 rounded-xl blur-md" />
                    <div className="relative w-8 h-8 bg-surface-800 border border-white/[0.08] rounded-xl flex items-center justify-center">
                      <Bot className="w-4 h-4 text-accent-teal" />
                    </div>
                  </div>
                )}
                <div className={`max-w-[80%] break-words overflow-hidden ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-brand-600/20 to-accent-teal/10 border border-brand-500/15 rounded-2xl rounded-tr-md px-4 py-3 shadow-lg shadow-brand-600/[0.05]'
                    : 'glass-card !rounded-2xl !rounded-tl-md px-4 py-3'
                }`}>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {msg.attachments.map((att, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent-indigo/10 text-accent-indigo text-xs border border-accent-indigo/15">
                          {att.type.startsWith('image/') ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                          {att.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {msg.role === 'user' ? (
                    <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="markdown-content text-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center gap-1.5 mb-2">
                        <BookOpen className="w-3 h-3 text-surface-400" />
                        <span className="text-xs text-surface-400 font-semibold uppercase tracking-wider">Sources</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, i) => (
                          <span key={i} className="badge-green text-xs">{src.subtopic || src.topic}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-surface-700 to-surface-800 border border-white/[0.06] rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-surface-300" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 animate-fade-in-up">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-accent-teal/20 rounded-xl blur-md animate-glow-pulse" />
                  <div className="relative w-8 h-8 bg-surface-800 border border-white/[0.06] rounded-xl flex items-center justify-center">
                    <Bot className="w-4 h-4 text-accent-teal" />
                  </div>
                </div>
                <div className="glass-card !rounded-2xl !rounded-tl-md px-5 py-4">
                  <div className="typing-indicator"><span></span><span></span><span></span></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-white/[0.06] bg-surface-900/80 backdrop-blur-2xl p-4">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="flex items-center gap-2.5 mb-3 text-xs text-amber-400 bg-amber-500/8 border border-amber-500/15 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Attached files preview */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachedFiles.map((file, i) => (
                <AttachmentPill key={i} file={file} onRemove={() => removeFile(i)} />
              ))}
            </div>
          )}

          {/* Voice listening indicator */}
          {isListening && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-accent-rose/8 border border-accent-rose/20 rounded-xl animate-fade-in">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-rose animate-voice-pulse" />
              <span className="text-xs text-accent-rose font-medium">Listening... speak your question</span>
              <button onClick={stopListening} className="ml-auto text-xs text-accent-rose/70 hover:text-accent-rose transition-colors">Stop</button>
            </div>
          )}

          <div className="flex gap-2 items-end">
            {messages.length > 0 && (
              <button
                onClick={startNewChat}
                className="h-12 w-12 flex items-center justify-center rounded-xl border border-white/[0.06] bg-surface-800/60 text-surface-400 hover:text-white hover:bg-surface-700/60 transition-all flex-shrink-0"
                title="New Chat"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-12 w-12 flex items-center justify-center rounded-xl border border-white/[0.06] bg-surface-800/60 text-surface-400 hover:text-accent-indigo hover:bg-accent-indigo/[0.06] hover:border-accent-indigo/20 transition-all flex-shrink-0"
              title="Attach file (images, PDF, text — max 5MB)"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input ref={fileInputRef} type="file" className="hidden" accept=".txt,.pdf,.csv,.md,.py,.json,image/*" multiple onChange={handleFileSelect} />

            {voiceSupported && (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`h-12 w-12 flex items-center justify-center rounded-xl border transition-all flex-shrink-0 ${
                  isListening
                    ? 'bg-accent-rose/15 border-accent-rose/30 text-accent-rose animate-voice-pulse'
                    : 'border-white/[0.06] bg-surface-800/60 text-surface-400 hover:text-accent-rose hover:bg-accent-rose/[0.06] hover:border-accent-rose/20'
                }`}
                title={isListening ? 'Stop listening' : 'Voice search'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a biotechnology question..."
                className="input-field resize-none min-h-[48px] max-h-[120px] !rounded-xl"
                rows={1}
                disabled={loading}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={(!input.trim() && attachedFiles.length === 0) || loading}
              className="h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:from-surface-700 disabled:to-surface-700 disabled:text-surface-500 text-white transition-all shadow-lg shadow-brand-600/20 disabled:shadow-none sparkle-hover flex-shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-surface-500 mt-2 text-center">
            Answers generated using RAG with curriculum-aligned content &bull; Attach files or use voice for richer interactions
          </p>
        </div>
      </div>
    </div>
  );
}
