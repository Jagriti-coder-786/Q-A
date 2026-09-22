import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/common/Button.jsx';
import { AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('alex.mercer@documind.ai');
    setPassword('password123');
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Sign in to your account
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your credentials to access your knowledge spaces.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Demo Account Helper */}
      <button
        type="button"
        onClick={fillDemoAccount}
        className="w-full mb-4 py-2 px-3 rounded-xl border border-dashed border-[#6D5EF7]/40 bg-[#6D5EF7]/10 text-[#A78BFA] text-xs font-medium flex items-center justify-center gap-2 hover:bg-[#6D5EF7]/20 transition"
      >
        <UserCheck className="w-3.5 h-3.5 text-[#22D3EE]" />
        <span>One-Click Demo Account (Alex Mercer)</span>
      </button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-[#94A3B8] mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex.mercer@documind.ai"
            className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#131A2A] text-slate-900 dark:text-[#F8FAFC] px-3.5 py-2.5 focus:ring-1 focus:ring-[#6D5EF7] focus:border-[#6D5EF7] focus:outline-none placeholder-slate-400 dark:placeholder-slate-600 transition"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-[#94A3B8]">
              Password
            </label>
            <span className="text-[11px] text-[#A78BFA] cursor-pointer hover:underline">
              Forgot password?
            </span>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#131A2A] text-slate-900 dark:text-[#F8FAFC] px-3.5 py-2.5 focus:ring-1 focus:ring-[#6D5EF7] focus:border-[#6D5EF7] focus:outline-none placeholder-slate-400 dark:placeholder-slate-600 transition"
          />
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          size="md"
          className="w-full mt-2"
          icon={ArrowRight}
        >
          Sign in to Workspace
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500 dark:text-[#64748B]">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-semibold text-[#6D5EF7] dark:text-[#A78BFA] hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
