import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { resetPassword } from '../services/api';

const ResetPassword = () => {
  const { id, token } = useParams();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      const response = await resetPassword(id, token, password);
      toast.success(response.msg || 'Password reset successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to reset password. Link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary)]/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-[var(--surface-color)] rounded-2xl shadow-xl border border-[var(--border-color)] overflow-hidden"
      >
        <div className="p-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-8">
            <ArrowLeft size={14} /> Back to Login
          </Link>

          <h1 className="text-2xl font-bold text-[var(--text-main)]">Reset Password</h1>
          <p className="text-[var(--text-muted)] text-sm mt-2 mb-8">Please enter your new password below.</p>

          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-main)] block">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-all shadow-lg shadow-red-500/20 disabled:opacity-70"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
              Update Password
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
