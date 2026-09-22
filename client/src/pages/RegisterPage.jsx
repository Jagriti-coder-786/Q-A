import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/common/Button.jsx';
import { AlertCircle, ArrowRight } from 'lucide-react';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register(name, email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Create your account
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Start turning your documents into verified knowledge.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-[#94A3B8] mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Mercer"
            className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#131A2A] text-slate-900 dark:text-[#F8FAFC] px-3.5 py-2.5 focus:ring-1 focus:ring-[#6D5EF7] focus:border-[#6D5EF7] focus:outline-none placeholder-slate-400 dark:placeholder-slate-600 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-[#94A3B8] mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex.mercer@example.com"
            className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#131A2A] text-slate-900 dark:text-[#F8FAFC] px-3.5 py-2.5 focus:ring-1 focus:ring-[#6D5EF7] focus:border-[#6D5EF7] focus:outline-none placeholder-slate-400 dark:placeholder-slate-600 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-[#94A3B8] mb-1">
            Password (min 6 characters)
          </label>
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
          Create Knowledge Account
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500 dark:text-[#64748B]">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-[#6D5EF7] dark:text-[#A78BFA] hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
