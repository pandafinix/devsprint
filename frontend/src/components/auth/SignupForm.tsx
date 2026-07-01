import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi, getErrorMessage } from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Mail, Lock, User, Zap, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import type { Role } from '../../types';

export const SignupForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
    role: 'USER' as Role,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.inviteCode.trim())
      newErrors.inviteCode = 'Invite code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const response = await authApi.signup({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
        inviteCode: formData.inviteCode.trim(),
        role: formData.role,
      });
      login(response);
      toast.success(`Welcome to ${response.companyName}, ${response.name}! 🎉`);
      if (response.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/board');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const detail = err.response?.data?.detail;
        if (status === 409) {
          toast.error('❌ Email already registered!');
          setErrors({ email: 'This email is already in use.' });
        } else if (detail) {
          toast.error(`❌ ${detail}`);
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

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 bg-primary-600 rounded-2xl mb-4">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Join Your Company</h1>
          <p className="text-slate-400 mt-2">
            Use your invite code to join your company workspace
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              leftIcon={<User size={16} />}
              error={errors.name}
              autoFocus
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
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

            <Input
              label="Company Invite Code"
              type="text"
              name="inviteCode"
              value={formData.inviteCode}
              onChange={handleChange}
              placeholder="e.g. INFO-X7K2"
              leftIcon={<KeyRound size={16} />}
              error={errors.inviteCode}
              helperText="Ask your admin for the invite code"
            />

            {/* Role Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">
                Join As
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['USER', 'ADMIN'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, role: r }))
                    }
                    className={`
                      px-4 py-2.5 rounded-lg border text-sm font-medium
                      transition-all duration-200
                      ${
                        formData.role === r
                          ? 'bg-primary-600 border-primary-500 text-white'
                          : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                      }
                    `}
                  >
                    {r === 'USER' ? '👤 Team Member' : '⚡ Admin'}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
            >
              {isLoading ? 'Joining...' : 'Join Company'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/60 text-center space-y-2">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                Sign in
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