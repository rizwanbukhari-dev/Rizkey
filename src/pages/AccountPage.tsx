import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useToast } from '../context/ToastContext';
import { authService, isSupabaseConfigured } from '../services/supabase';
import { formatDuration } from '../utils/metrics';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  User,
  Shield,
  Cloud,
  CloudUpload,
  CheckCircle,
  AlertCircle,
  Lock,
  Mail,
  LogOut,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const {
    currentUser,
    totalTests,
    streak,
    bestWpm,
    totalTimeSeconds,
    lessons,
    syncWithCloud,
  } = useProgress();
  const { toast } = useToast();

  const supabaseReady = isSupabaseConfigured();

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const completedLessonsCount = Object.values(lessons).filter((l) => l.completed).length;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseReady) return;

    setLoading(true);

    try {
      if (authMode === 'signin') {
        await authService.signIn(email, password);
        toast.success('Signed in successfully! Progress synchronized.');
        window.location.reload();
      } else if (authMode === 'signup') {
        await authService.signUp(email, password);
        toast.success('Account created! Please check your email for confirmation.');
      } else if (authMode === 'reset') {
        await authService.resetPassword(email);
        toast.info('Password reset instructions sent to your email.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      toast.info('Signed out. Switched back to guest mode.');
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Error signing out.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToCloud = async () => {
    setSyncing(true);
    try {
      const ok = await syncWithCloud();
      if (ok) {
        toast.success('Local typing statistics backed up to cloud!');
      } else {
        toast.error('Cloud synchronization failed. Check connection.');
      }
    } catch {
      toast.error('Cloud synchronization error.');
    } finally {
      setSyncing(false);
    }
  };

  const handleCopyEnv = async () => {
    const envSnippet = `VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;
    try {
      await navigator.clipboard.writeText(envSnippet);
      setCopiedEnv(true);
      toast.success('Environment template copied to clipboard!');
      setTimeout(() => setCopiedEnv(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard.');
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="amber" size="sm">
            <Shield className="w-3 h-3 mr-1" />
            Zero Tracking &bull; Offline First
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#ECEBE4] flex items-center gap-2.5">
          <User className="w-6 h-6 text-[#E6C76B]" />
          <span>Account &amp; Cloud Sync</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#989A92] mt-1">
          RizKey is built offline-first with full local persistence. Cloud synchronization is completely optional.
        </p>
      </div>

      {/* Guest Mode Summary Card */}
      <div className="p-6 rounded-2xl bg-[#272824] border border-[#353630] mb-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#353630] mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5DBE76] animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#ECEBE4] uppercase tracking-wider">
              {currentUser ? 'Cloud Account Synchronized' : 'Guest Mode Active'}
            </span>
          </div>
          <Badge variant={currentUser ? 'green' : 'gray'} size="xs">
            {currentUser ? 'Cloud Connected' : 'Local Web Storage'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-center mb-4">
          <div className="p-3.5 rounded-xl bg-[#20211D] border border-[#353630]">
            <span className="text-[10px] text-[#989A92] uppercase block">Tests Taken</span>
            <span className="text-xl font-bold text-[#ECEBE4]">{totalTests}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#20211D] border border-[#353630]">
            <span className="text-[10px] text-[#989A92] uppercase block">Best Speed</span>
            <span className="text-xl font-bold text-[#E6C76B]">{bestWpm} WPM</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#20211D] border border-[#353630]">
            <span className="text-[10px] text-[#989A92] uppercase block">Practice Time</span>
            <span className="text-xl font-bold text-[#ECEBE4]">{formatDuration(totalTimeSeconds)}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#20211D] border border-[#353630]">
            <span className="text-[10px] text-[#989A92] uppercase block">Lessons Done</span>
            <span className="text-xl font-bold text-[#5DBE76]">{completedLessonsCount} / 15</span>
          </div>
        </div>

        <p className="text-xs text-[#989A92] leading-relaxed">
          Your typing history, lesson completions, streak data, and preferences are safely preserved right now on this device. No registration is required to enjoy the full platform.
        </p>
      </div>

      {/* Cloud Authentication Section */}
      <div className="p-6 rounded-2xl bg-[#272824] border border-[#353630]">
        <div className="flex items-center justify-between pb-4 border-b border-[#353630] mb-6">
          <h2 className="text-sm font-mono font-medium text-[#ECEBE4] flex items-center gap-2">
            <Cloud className="w-4 h-4 text-[#E6C76B]" />
            <span>Supabase Cloud Backup</span>
          </h2>
          <Badge variant={supabaseReady ? 'green' : 'amber'} size="xs">
            {supabaseReady ? 'Supabase Ready' : 'Self-Host / Optional'}
          </Badge>
        </div>

        {!supabaseReady ? (
          /* Missing Supabase Config Explanation */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#20211D] border border-[#353630] text-xs font-mono leading-relaxed text-[#989A92]">
              <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>Supabase Environment Variables Not Configured</span>
              </div>
              <p className="mb-3">
                Cloud sync is an optional enhancement for multi-device syncing. Guest mode operates 100% locally with zero setup needed.
              </p>
              <p className="mb-2 text-[#ECEBE4]">
                To activate Supabase authentication and cloud backup:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[#7E8079]">
                <li>Create a free project at <span className="text-[#E6C76B]">supabase.com</span></li>
                <li>Execute SQL schema found in <code className="text-[#ECEBE4]">supabase/schema.sql</code></li>
                <li>Set these environment variables in your <code className="text-[#ECEBE4]">.env.local</code> file:</li>
              </ol>

              <div className="relative mt-3">
                <pre className="p-3 rounded-lg bg-[#181915] text-[#E6C76B] overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...`}
                </pre>
                <button
                  onClick={handleCopyEnv}
                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-[#272824] text-[10px] text-[#ECEBE4] hover:text-[#E6C76B] border border-[#353630] transition-colors"
                >
                  {copiedEnv ? <Check className="w-3 h-3 text-[#5DBE76]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEnv ? 'Copied' : 'Copy Template'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : currentUser ? (
          /* User Logged In */
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-[#20211D] border border-[#353630] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-[#989A92] uppercase block">Signed in as</span>
                <span className="text-sm font-bold text-[#ECEBE4]">{currentUser.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                isLoading={loading}
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
              >
                Sign Out
              </Button>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleSyncToCloud}
                isLoading={syncing}
                leftIcon={<CloudUpload className="w-4 h-4" />}
              >
                Sync Local Data to Cloud
              </Button>
            </div>
          </div>
        ) : (
          /* Login / Signup Form */
          <div className="max-w-md mx-auto">
            {/* Tabs */}
            <div className="flex border-b border-[#353630] mb-6 text-xs font-mono">
              <button
                onClick={() => setAuthMode('signin')}
                className={`flex-1 py-2 text-center border-b-2 font-medium transition-colors ${authMode === 'signin' ? 'border-[#E6C76B] text-[#E6C76B]' : 'border-transparent text-[#989A92] hover:text-[#ECEBE4]'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 text-center border-b-2 font-medium transition-colors ${authMode === 'signup' ? 'border-[#E6C76B] text-[#E6C76B]' : 'border-transparent text-[#989A92] hover:text-[#ECEBE4]'}`}
              >
                Create Account
              </button>
              <button
                onClick={() => setAuthMode('reset')}
                className={`flex-1 py-2 text-center border-b-2 font-medium transition-colors ${authMode === 'reset' ? 'border-[#E6C76B] text-[#E6C76B]' : 'border-transparent text-[#989A92] hover:text-[#ECEBE4]'}`}
              >
                Reset Password
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#989A92] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#7E8079]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="typist@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#20211D] border border-[#353630] text-[#ECEBE4] focus:outline-none focus:border-[#E6C76B]"
                  />
                </div>
              </div>

              {authMode !== 'reset' && (
                <div>
                  <label className="block text-[#989A92] mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#7E8079]" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#20211D] border border-[#353630] text-[#ECEBE4] focus:outline-none focus:border-[#E6C76B]"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full"
              >
                {authMode === 'signin'
                  ? 'Sign In & Sync'
                  : authMode === 'signup'
                  ? 'Register & Transfer Progress'
                  : 'Send Password Reset'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
