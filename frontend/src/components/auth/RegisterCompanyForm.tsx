import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi, getErrorMessage } from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Building2, Mail, Lock, User, Zap, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export const RegisterCompanyForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName.trim())
      newErrors.companyName = 'Company name is required';
    if (!formData.name.trim())
      newErrors.name = 'Your name is required';
    if (!formData.email)
      newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Please enter a valid email';
    if (!formData.password)
      newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast.success('✅ Invite code copied!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const response = await authApi.registerCompany({
        companyName: formData.companyName.trim(),
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      });
      login(response);
      setInviteCode(response.inviteCode);
      setShowSuccess(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 409) {
          toast.error('❌ Email already registered!');
          setErrors({ email: 'This email is already in use.' });
        } else {
          toast.error(getErrorMessage(err));
        }
      } else {
        toast.error('Something went wrong.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success Screen with Invite Code ──
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-8 shadow-2xl">

            {/* Success Icon */}
            <div className="inline-flex items-center justify-center h-16 w-16 bg-green-600/20 border-2 border-green-500/30 rounded-full mb-6">
              <span className="text-3xl">🎉</span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Company Created!
            </h1>
            <p className="text-slate-400 mb-8">
              Share this invite code with your team members
            </p>

            {/* Invite Code Box */}
            <div className="bg-slate-800 border-2 border-primary-500/40 rounded-xl p-6 mb-6">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                Your Invite Code
              </p>
              <p className="text-3xl font-mono font-bold text-primary-400 tracking-widest mb-4">
                {inviteCode}
              </p>
              <Button
                size="sm"
                onClick={handleCopyCode}
                className="mx-auto"
              >
                📋 Copy Code
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-medium text-slate-300 mb-3">
                Next Steps:
              </p>
              <ol className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 font-bold">1.</span>
                  Share the invite code with your team
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 font-bold">2.</span>
                  Team members go to "Join Company" page
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 font-bold">3.</span>
                  They enter the code and select their role
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-400 font-bold">4.</span>
                  Set email domain restrictions in your dashboard
                </li>
              </ol>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={() => navigate('/master/dashboard')}
            >
              Go to Dashboard →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration Form ──
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

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 bg-primary-600 rounded-2xl mb-4">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Register Company</h1>
          <p className="text-slate-400 mt-2">
            Create your company workspace on DevSprint
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            <Input
              label="Company Name"
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Google, Stripe, Your Company"
              leftIcon={<Building2 size={16} />}
              error={errors.companyName}
              autoFocus
            />

            <Input
              label="Your Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              leftIcon={<User size={16} />}
              error={errors.name}
            />

            <Input
              label="Your Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              leftIcon={<Lock size={16} />}
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              error={errors.confirmPassword}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
            >
              {isLoading ? 'Creating Company...' : 'Create Company'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/60 text-center space-y-2">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                Sign in
              </Link>
            </p>
            <p className="text-slate-400 text-sm">
              Have an invite code?{' '}
              <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium">
                Join Company
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};