import { useEffect, useState } from 'react';
import { createPageUrl } from '@/utils';
import { supabase } from '@/lib/supabaseClient';
import { useTheme } from '@/components/shared/ThemeContext';
import { Sun, Moon, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session && isMounted) redirectToDashboard();
    };
    checkSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) redirectToDashboard();
    });
    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const redirectToDashboard = () => {
    window.location.href = createPageUrl('Dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    if (forgotMode) {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + createPageUrl('Dashboard'),
      });
      setIsSubmitting(false);
      if (resetError) { setError(resetError.message); return; }
      setSuccessMsg('Check your email for the password reset link.');
      return;
    }

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      setIsSubmitting(false);
      if (signUpError) { setError(signUpError.message); return; }
      setSuccessMsg('Account created! Check your email to confirm, then sign in.');
      setMode('signin');
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);
    if (signInError) { setError(signInError.message); return; }
    redirectToDashboard();
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + createPageUrl('Dashboard') },
    });
    if (oauthError) setError(oauthError.message);
  };

  const inputClass =
    'w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ' +
    'bg-white dark:bg-slate-800 ' +
    'border-slate-200 dark:border-slate-700 ' +
    'text-slate-900 dark:text-slate-100 ' +
    'placeholder-slate-400 dark:placeholder-slate-500 ' +
    'focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 transition-colors duration-300">

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-slate-950/50 border border-slate-200/60 dark:border-slate-800 p-8 space-y-6">

          {/* Logo + Title */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-lg mx-auto">
              <span className="text-white text-2xl font-bold">R</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {forgotMode
                  ? 'Reset Password'
                  : mode === 'signup'
                    ? 'Create Account'
                    : 'Welcome to Rawajcard'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {forgotMode
                  ? "Enter your email and we'll send a reset link"
                  : mode === 'signup'
                    ? 'Sign up to get started for free'
                    : 'Sign in to continue'}
              </p>
            </div>
          </div>

          {/* Google button (not in forgot mode) */}
          {!forgotMode && (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          )}

          {!forgotMode && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">OR</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {!forgotMode && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass + ' pr-10'}
                    required
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="rounded-xl border border-teal-200 dark:border-teal-800/50 bg-teal-50 dark:bg-teal-950/30 px-4 py-3 text-sm text-teal-700 dark:text-teal-400">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:bg-slate-700 dark:hover:bg-slate-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting
                ? 'Please wait...'
                : forgotMode
                  ? 'Send Reset Link'
                  : mode === 'signup'
                    ? 'Create Account'
                    : 'Sign in'}
            </button>
          </form>

          {/* Footer links */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            {!forgotMode ? (
              <>
                <button
                  type="button"
                  onClick={() => { setForgotMode(true); setError(null); setSuccessMsg(null); }}
                  className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  Forgot password?
                </button>
                <span>
                  {mode === 'signin' ? "Need an account? " : "Have an account? "}
                  <button
                    type="button"
                    onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setSuccessMsg(null); }}
                    className="font-semibold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                  </button>
                </span>
              </>
            ) : (
              <button
                type="button"
                onClick={() => { setForgotMode(false); setError(null); setSuccessMsg(null); }}
                className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                ← Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
