import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi, getErrorMessage } from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Mail, Lock, Zap, ArrowLeft, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [removedMessage, setRemovedMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (removedMessage) setRemovedMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setRemovedMessage(null);

    try {
      const response = await authApi.login(formData);
      login(response);
      toast.success(`Welcome back, ${response.name}! 🚀`);

      if (response.role === 'MASTER_ADMIN') {
        navigate('/master/dashboard');
      } else if (response.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/board');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const detail = err.response?.data?.detail;

        // ✅ User removed/deactivated
        if (
          status === 403 ||
          (detail && (
            detail.toLowerCase().includes('removed') ||
            detail.toLowerCase().includes('deactivated')
          ))
        ) {
          setRemovedMessage(detail || 'You have been removed from your company.');
          toast.error('❌ Account removed from company');
        }
        // ✅ Email doesn't exist
        else if (
          status === 404 ||
          (detail && detail.toLowerCase().includes('no account'))
        ) {
          toast.error('❌ No account found! Please sign up first.');
          setErrors({
            email: 'No account found with this email. Please sign up first.',
          });
        }
        // ✅ Wrong password
        else if (
          status === 401 ||
          (detail && detail.toLowerCase().includes('wrong password'))
        ) {
          toast.error('❌ Wrong password! Please try again.');
          setErrors({
            password: 'Incorrect password. Please try again.',
          });
        } else {
          toast.error(getErrorMessage(err));
        }
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 bg-primary-600 rounded-2xl mb-4">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 mt-2">
            Sign in to your DevSprint account
          </p>
        </div>

        {/* ✅ Removed Account Banner */}
        {removedMessage && (
          <div className="mb-6 bg-red-950/40 border-2 border-red-700/40 rounded-2xl p-5 animate-slide-up">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-red-600/20 border border-red-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-300 mb-1">
                  Account Removed
                </h3>
                <p className="text-xs text-red-200/80 leading-relaxed mb-3">
                  {removedMessage}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    to="/signup"
                    className="text-xs bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 px-3 py-2 rounded-lg transition-all font-medium text-center"
                  >
                    Join Another Company
                  </Link>
                  <Link
                    to="/register-company"
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-3 py-2 rounded-lg transition-all font-medium text-center"
                  >
                    Register New Company
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email}
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 pt-6 border-t border-slate-700/60 text-center space-y-2">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                Join Company
              </Link>
            </p>
            <p className="text-slate-400 text-sm">
              New company?{' '}
              <Link
                to="/register-company"
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                Register your company
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};