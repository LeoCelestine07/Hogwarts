import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, KeyRound, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'reset'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    newPassword: ''
  });

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { 
        email: formData.email,
        user_type: 'user'
      });
      toast.success('Password reset OTP sent!');
      setMode('reset');
      startCountdown();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Email not found');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }
    if (!formData.newPassword || formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, {
        email: formData.email,
        otp,
        new_password: formData.newPassword,
        user_type: 'user'
      });
      
      toast.success('Password reset successful! Please login.');
      setMode('login');
      setOtp('');
      setFormData({ ...formData, password: '', newPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setResending(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { 
        email: formData.email,
        user_type: 'user'
      });
      toast.success('New OTP sent!');
      setOtp('');
      startCountdown();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" data-testid="login-page">
      {/* Background */}
      <div className="fixed inset-0 bg-[#030305] -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-cyan-900/10" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-heavy rounded-3xl p-8 md:p-10 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {mode === 'login' ? 'Welcome Back' : 
               mode === 'forgot' ? 'Forgot Password' : 
               'Reset Password'}
            </h1>
            <p className="text-white/50 text-sm">
              {mode === 'login' ? 'Sign in to view your bookings' : 
               mode === 'forgot' ? 'Enter your email to receive reset OTP' :
               'Enter OTP and create new password'}
            </p>
          </div>

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-white/60 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white placeholder:text-white/30 focus:border-cyan-500/50 transition-colors"
                    data-testid="login-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-4 text-white placeholder:text-white/30 focus:border-cyan-500/50 transition-colors"
                    data-testid="login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white text-black font-bold hover:scale-[1.02] transition-transform disabled:opacity-50"
                data-testid="login-submit"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-sm text-white/60 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your registered email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white placeholder:text-white/30 focus:border-cyan-500/50 transition-colors"
                    data-testid="forgot-email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-bold hover:scale-[1.02] transition-transform disabled:opacity-50"
                data-testid="forgot-submit"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Send Reset OTP
                    <KeyRound className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Reset Password Form */}
          {mode === 'reset' && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-white/50 text-sm mb-4">
                  OTP sent to <span className="text-cyan-400">{formData.email}</span>
                </p>
                <InputOTP 
                  maxLength={6} 
                  value={otp} 
                  onChange={setOtp}
                  data-testid="reset-otp-input"
                >
                  <InputOTPGroup className="gap-2 justify-center">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <InputOTPSlot 
                        key={i} 
                        index={i} 
                        className="w-12 h-14 text-xl bg-white/5 border-white/10 rounded-xl"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>

                {/* Resend OTP Button */}
                <div className="mt-4">
                  {countdown > 0 ? (
                    <p className="text-white/40 text-sm">Resend OTP in {countdown}s</p>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      disabled={resending}
                      className="flex items-center gap-2 mx-auto text-cyan-400 hover:text-cyan-300 text-sm"
                    >
                      {resending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-4 text-white placeholder:text-white/30 focus:border-cyan-500/50 transition-colors"
                    data-testid="reset-new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-bold hover:scale-[1.02] transition-transform disabled:opacity-50"
                data-testid="reset-submit"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          <div className="mt-8 text-center space-y-4">
            {mode !== 'login' && (
              <button
                onClick={() => { setMode('login'); setOtp(''); setCountdown(0); }}
                className="text-white/40 hover:text-white/60 text-sm"
              >
                ← Back to Login
              </button>
            )}
            {mode === 'login' && (
              <>
                <p className="text-white/40 text-sm">
                  Do not have an account?{' '}
                  <Link to="/register" className="text-cyan-400 hover:text-cyan-300">
                    Sign up
                  </Link>
                </p>
                <p className="text-white/40 text-sm">
                  <Link to="/admin/login" className="text-purple-400 hover:text-purple-300">
                    Admin Login →
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
