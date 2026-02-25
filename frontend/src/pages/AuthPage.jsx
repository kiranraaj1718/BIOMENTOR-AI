import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dna, Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';

export default function AuthPage() {
  // mode: 'login' | 'register' | 'reset'
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, resetPassword } = useAuth();
  const navigate = useNavigate();

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/');
      } else if (mode === 'register') {
        if (!username.trim()) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        await register(email, username, password, fullName);
        navigate('/');
      } else if (mode === 'reset') {
        await resetPassword(email, password);
        setSuccess('Password reset successful! You are now logged in.');
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail) {
        setError(detail);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please make sure the backend is running.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 hex-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-radial from-brand-500/[0.1] to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-[20%] w-[300px] h-[300px] bg-gradient-radial from-amber-500/[0.05] to-transparent rounded-full blur-3xl pointer-events-none animate-float morph-blob" />
      <div className="absolute top-[30%] right-[10%] w-[200px] h-[200px] bg-gradient-radial from-yellow-500/[0.05] to-transparent rounded-full blur-3xl pointer-events-none animate-float-delayed morph-blob" style={{ animationDelay: '3s' }} />
      {/* Decorative spinning rings */}
      <div className="absolute top-[10%] left-[10%] w-[100px] h-[100px] border border-brand-500/[0.06] rounded-full animate-spin-slow pointer-events-none" />
      <div className="absolute bottom-[15%] right-[15%] w-[70px] h-[70px] border border-sky-400/[0.05] rounded-full animate-counter-spin pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-18 h-18 rounded-2xl mb-5 glow-breathe">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-brand-700/20 rounded-2xl blur-lg" />
            <div className="relative w-18 h-18 bg-surface-900/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl flex items-center justify-center gradient-border-animated">
              <Dna className="w-9 h-9 text-brand-400" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight neon-text">BioMentor AI</h1>
          <p className="text-surface-400 text-sm mt-1.5">AI-Powered Biotechnology Tutor</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-6 sm:p-8 relative overflow-hidden animate-slide-up-spring corner-accents" style={{ animationDelay: '0.05s' }}>
          {/* Top glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-brand-500/[0.06] rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            {/* Tab switcher */}
            <div className="flex bg-surface-800/60 rounded-xl p-1 mb-6">
              <button
                onClick={() => switchMode('login')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  mode === 'login' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-surface-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode('register')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  mode === 'register' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-surface-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/15 rounded-xl text-red-400 text-sm flex items-start gap-2.5 animate-fade-in">
                <div className="w-5 h-5 bg-red-500/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">!</span>
                </div>
                <div>
                  {error}
                  {mode === 'login' && error.includes('Invalid') && (
                    <button
                      type="button"
                      onClick={() => switchMode('reset')}
                      className="block mt-1.5 text-xs text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors"
                    >
                      Forgot password? Reset it here
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/15 rounded-xl text-emerald-400 text-sm flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}

            {/* Reset password mode header */}
            {mode === 'reset' && (
              <div className="mb-4 p-3 bg-accent-sky/5 border border-accent-sky/15 rounded-xl animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <KeyRound className="w-4 h-4 text-accent-sky" />
                  <span className="text-sm font-semibold text-white">Reset Password</span>
                </div>
                <p className="text-xs text-surface-400">Enter your email and choose a new password.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-4 animate-fade-in-up">
                  <div>
                    <label className="block text-xs font-semibold text-surface-300 mb-2 uppercase tracking-wider">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="input-field pl-11"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-300 mb-2 uppercase tracking-wider">Username</label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input-field pl-11"
                        placeholder="Choose a username"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-surface-300 mb-2 uppercase tracking-wider">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-11"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-300 mb-2 uppercase tracking-wider">
                  {mode === 'reset' ? 'New Password' : 'Password'}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-11 pr-11"
                    placeholder={mode === 'reset' ? 'Choose a new password' : 'Enter your password'}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary sparkle-hover w-full flex items-center justify-center gap-2.5 py-3.5 text-base mt-2"
              >
                {loading ? (
                  <div className="spinner" />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Reset Password'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Mode switching links */}
            <div className="mt-4 text-center space-y-2">
              {mode === 'login' && (
                <button
                  onClick={() => switchMode('reset')}
                  className="text-xs text-surface-500 hover:text-brand-400 transition-colors"
                >
                  Forgot your password?
                </button>
              )}
              {mode === 'reset' && (
                <button
                  onClick={() => switchMode('login')}
                  className="text-xs text-surface-500 hover:text-brand-400 transition-colors flex items-center gap-1 mx-auto"
                >
                  ← Back to Sign In
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Skip auth */}
        <div className="text-center mt-5">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-surface-500 hover:text-brand-400 transition-colors inline-flex items-center gap-1.5 group"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Continue without signing in
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
