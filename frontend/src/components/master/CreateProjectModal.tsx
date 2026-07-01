import React, { useState, useEffect } from 'react';
import { projectApi, getErrorMessage } from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { CreateProjectRequest, UserResponse } from '../../types';
import { X, FolderPlus, Users, Shield, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAdmins, setSelectedAdmins] = useState<Set<number>>(new Set());
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  const [availableAdmins, setAvailableAdmins] = useState<UserResponse[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserResponse[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setSelectedAdmins(new Set());
      setSelectedUsers(new Set());
      setNameError('');
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const [admins, users] = await Promise.all([
        projectApi.getAllAdmins(),
        projectApi.getAvailableUsers(),
      ]);
      setAvailableAdmins(admins);
      setAvailableUsers(users);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  };

  const toggleAdmin = (id: number) => {
    setSelectedAdmins((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleUser = (id: number) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Project name is required');
      return;
    }

    if (selectedAdmins.size === 0) {
      toast.error('Please select at least one admin');
      return;
    }

    setIsLoading(true);
    try {
      const data: CreateProjectRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        adminIds: Array.from(selectedAdmins),
        userIds: Array.from(selectedUsers),
      };
      await projectApi.createProject(data);
      toast.success(`✅ Project "${name}" created successfully!`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary-600/20 rounded-lg flex items-center justify-center">
              <FolderPlus size={16} className="text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Create New Project</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >

          <Input
            label="Project Name *"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            placeholder="e.g. Mobile App Development"
            error={nameError}
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the project..."
              rows={2}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Select Admins */}
          <div>
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-2">
              <Shield size={14} className="text-yellow-400" />
              Select Admins *
              <span className="text-xs text-slate-500">
                ({selectedAdmins.size} selected)
              </span>
            </label>

            <div className="border border-slate-700 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
              {isFetching ? (
                <p className="text-sm text-slate-500 text-center py-4">Loading...</p>
              ) : availableAdmins.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No admins available. Ask admins to signup first.
                </p>
              ) : (
                availableAdmins.map((admin) => {
                  const isSelected = selectedAdmins.has(admin.id);
                  return (
                    <div
                      key={admin.id}
                      onClick={() => toggleAdmin(admin.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-yellow-600/20 border border-yellow-500/40'
                          : 'bg-slate-800/50 border border-slate-700/40 hover:border-slate-500/60'
                      }`}
                    >
                      <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-yellow-500 border-yellow-500'
                          : 'border-slate-600'
                      }`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">
                          {admin.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {admin.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{admin.email}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Select Users */}
          <div>
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-2">
              <Users size={14} className="text-blue-400" />
              Select Available Users
              <span className="text-xs text-slate-500">
                ({selectedUsers.size} selected)
              </span>
            </label>

            <div className="border border-slate-700 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
              {isFetching ? (
                <p className="text-sm text-slate-500 text-center py-4">Loading...</p>
              ) : availableUsers.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  No available users. All users are in other projects or none have signed up.
                </p>
              ) : (
                availableUsers.map((user) => {
                  const isSelected = selectedUsers.has(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => toggleUser(user.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border border-blue-500/40'
                          : 'bg-slate-800/50 border border-slate-700/40 hover:border-slate-500/60'
                      }`}
                    >
                      <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-slate-600'
                      }`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-primary-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-slate-500">
            {selectedAdmins.size} admin{selectedAdmins.size !== 1 ? 's' : ''}, {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              isLoading={isLoading}
              leftIcon={<FolderPlus size={14} />}
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};