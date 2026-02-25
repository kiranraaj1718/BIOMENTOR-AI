import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import {
  User, Mail, Edit3, Save, X, Lock, Eye, EyeOff, Shield, Clock,
  CheckCircle2, AlertCircle, Dna, Sparkles, ArrowRight
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Feedback
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Server profile
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    authAPI.getProfile()
      .then(res => setProfile(res.data))
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const clearFeedback = () => { setError(''); setSuccess(''); };

  const handleSaveProfile = async () => {
    clearFeedback();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile({
        username: username || undefined,
        full_name: fullName,
        email: email || undefined,
      });
      updateUser(res.data.user);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    clearFeedback();
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword({ current_password: currentPassword, new_password: newPassword });
      setSuccess('Password changed successfully!');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-4 lg:p-8 animate-fade-in text-center mt-20">
        <div className="w-16 h-16 bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <User className="w-8 h-8 text-surface-500" />
        </div>
        <h2 className="text-xl font-display font-bold text-white mb-2">Sign In Required</h2>
        <p className="text-surface-400 text-sm mb-6">Please sign in to view your profile.</p>
        <button onClick={() => navigate('/auth')} className="btn-primary inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Sign In <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const initial = (user?.full_name || user?.username || 'U')[0].toUpperCase();

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-8 animate-blur-in">
      {/* Header */}
      <div className="text-center mb-8 animate-slide-up-spring" style={{ animationDelay: '0.05s' }}>
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-brand-500 to-brand-400 rounded-2xl flex items-center justify-center shadow-glow glow-breathe gradient-border-animated">
          <span className="text-3xl font-display font-bold text-white">{initial}</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-white neon-text">{user?.full_name || user?.username}</h1>
        <p className="text-surface-400 text-sm mt-1">{user?.email}</p>
        <div className="glow-line mx-auto mt-4 w-24" />
      </div>

      {/* Feedback */}
      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-xl text-emerald-400 text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/15 rounded-xl text-red-400 text-sm flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Profile Info Card */}
      <div className="glass-card hover-tilt glass-card-shine p-6 mb-4 corner-accents">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-accent-teal" /> Profile Information
          </h2>
          {!editing ? (
            <button onClick={() => { setEditing(true); clearFeedback(); }} className="btn-ghost text-xs flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { setEditing(false); setFullName(user.full_name || ''); setUsername(user.username || ''); setEmail(user.email || ''); clearFeedback(); }} className="btn-ghost text-xs flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={handleSaveProfile} disabled={loading} className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5">
                {loading ? <div className="spinner" /> : <><Save className="w-3.5 h-3.5" /> Save</>}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-400 mb-1.5 uppercase tracking-wider">Full Name</label>
            {editing ? (
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field pl-11" placeholder="Your full name" />
              </div>
            ) : (
              <p className="text-surface-200 text-sm py-2 px-3 bg-surface-800/40 rounded-xl border border-white/[0.04]">{user?.full_name || '—'}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-400 mb-1.5 uppercase tracking-wider">Username</label>
            {editing ? (
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="input-field pl-11" placeholder="username" required />
              </div>
            ) : (
              <p className="text-surface-200 text-sm py-2 px-3 bg-surface-800/40 rounded-xl border border-white/[0.04]">{user?.username}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-400 mb-1.5 uppercase tracking-wider">Email</label>
            {editing ? (
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-11" placeholder="your@email.com" required />
              </div>
            ) : (
              <p className="text-surface-200 text-sm py-2 px-3 bg-surface-800/40 rounded-xl border border-white/[0.04]">{user?.email}</p>
            )}
          </div>

          {profile?.created_at && (
            <div>
              <label className="block text-xs font-semibold text-surface-400 mb-1.5 uppercase tracking-wider">Member Since</label>
              <p className="text-surface-200 text-sm py-2 px-3 bg-surface-800/40 rounded-xl border border-white/[0.04] flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-surface-500" />
                {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Card */}
      <div className="glass-card hover-tilt glass-card-shine p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-accent-amber" /> Security
          </h2>
          {!showPasswordForm && (
            <button onClick={() => { setShowPasswordForm(true); clearFeedback(); }} className="btn-ghost text-xs flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Change Password
            </button>
          )}
        </div>

        {showPasswordForm ? (
          <form onSubmit={handleChangePassword} className="space-y-4 animate-fade-in-up">
            <div>
              <label className="block text-xs font-semibold text-surface-400 mb-1.5 uppercase tracking-wider">Current Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
                <input
                  type={showCurrent ? 'text' : 'password'} value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)} className="input-field pl-11 pr-11" required
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-400 mb-1.5 uppercase tracking-wider">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
                <input
                  type={showNew ? 'text' : 'password'} value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} className="input-field pl-11 pr-11" required minLength={6}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); clearFeedback(); }} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? <div className="spinner" /> : <><Shield className="w-4 h-4" /> Change Password</>}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-xs text-surface-400">You can update your password to keep your account secure.</p>
        )}
      </div>

      {/* Danger zone */}
      <div className="glass-card p-6 border border-red-500/10">
        <h2 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-xs text-surface-400 mb-4">Once you delete your account, all your data (quizzes, chat history, learning progress) will be permanently removed.</p>
        <button
          onClick={async () => {
            if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
              try {
                await authAPI.deleteAccount();
                logout();
                navigate('/');
              } catch {
                setError('Failed to delete account');
              }
            }
          }}
          className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-4 py-2 rounded-xl transition-all hover:bg-red-500/5"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
