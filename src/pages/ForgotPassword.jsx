import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await forgotPassword(email);
      setSent(true);
      toast.success(response.msg || "Reset link sent!");
      if (response.previewUrl) {
          console.log("Password Reset Link preview (For Dev):", response.previewUrl);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to send reset link');
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

          {!sent ? (
            <>
              <h1 className="text-2xl font-bold text-[var(--text-main)]">Forgot Password?</h1>
              <p className="text-[var(--text-muted)] text-sm mt-2 mb-8">No worries! Enter your email below and we'll send you a password reset link.</p>

              <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-main)] block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your registered email"
                      className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-main)] pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-all shadow-lg shadow-red-500/20 disabled:opacity-70"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  Send Reset Link
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send size={28} />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-main)]">Check your email</h2>
              <p className="text-[var(--text-muted)] text-sm mt-3 mb-8">We've sent a password reset link to <br/><strong className="text-[var(--text-main)]">{email}</strong></p>
              <button 
                onClick={() => setSent(false)} 
                className="text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                Didn't receive it? Try again
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
