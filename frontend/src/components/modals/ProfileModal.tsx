import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi, getErrorMessage } from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ChangePasswordModal } from './ChangePasswordModal';
import { X, User, Mail, Save, Shield, KeyRound, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name);
      setErrors({});
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPasswordModalOpen) onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isPasswordModalOpen]);

  if (!isOpen || !user) return null;

  const validate = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = name.trim() !== user.name;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!hasChanges) {
      toast('No changes to save', { icon: 'ℹ️' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.updateProfile({
        name: name.trim(),
        email: user.email,
      });

      updateUser(
        {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role ?? user.role,
          companyId: response.companyId ?? user.companyId,
          companyName: response.companyName ?? user.companyName,
          inviteCode: user.inviteCode,
        },
        response.token || undefined
      );

      toast.success('✅ Name updated successfully!');
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(getErrorMessage(err));
      } else {
        toast.error('Failed to update profile.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-slide-up">

          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary-600/20 rounded-lg flex items-center justify-center">
                <User size={16} className="text-primary-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-primary-600/20 border-2 border-primary-500/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-400">
                  {name.trim().charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            </div>

            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name)
                  setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Your full name"
              leftIcon={<User size={16} />}
              error={errors.name}
              autoFocus
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                Email Address
                <Lock size={11} className="text-slate-500" />
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-400 cursor-not-allowed select-none"
                />
                <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Lock size={10} />
                Email cannot be changed
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                leftIcon={<Save size={14} />}
                disabled={!hasChanges}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>

          <div className="px-6 py-4 border-t border-slate-700/60 bg-slate-800/30 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-yellow-600/10 border border-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Shield size={16} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">Password</p>
                  <p className="text-xs text-slate-500">
                    Keep your account secure
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<KeyRound size={13} />}
                onClick={() => setIsPasswordModalOpen(true)}
              >
                Change
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};