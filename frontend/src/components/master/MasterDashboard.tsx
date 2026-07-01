import React, { useEffect, useState, useCallback } from 'react';
import { masterApi, projectApi, getErrorMessage } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import type { Company, UserResponse, Project } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { CreateProjectModal } from './CreateProjectModal';
import { ManageProjectMembersModal } from './ManageProjectMembersModal';
import {
  Building2, Users, Shield, Copy, Trash2, Globe,
  CheckCircle, XCircle, Calendar, Sparkles, Crown,
  Key, Settings, UserCog, Mail, Edit3, Check, X,
  FolderPlus, FolderKanban, Plus, Trophy,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MasterDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [admins, setAdmins] = useState<UserResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [domain, setDomain] = useState('');
  const [isSavingDomain, setIsSavingDomain] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [managingProject, setManagingProject] = useState<Project | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [companyData, adminsData, usersData, projectsData] = await Promise.all([
        masterApi.getCompanyInfo(),
        masterApi.getAdmins(),
        masterApi.getUsers(),
        projectApi.getAllProjects(),
      ]);
      setCompany(companyData);
      setAdmins(adminsData);
      setUsers(usersData);
      setProjects(projectsData);
      setDomain(companyData.domain ?? '');
      setCompanyName(companyData.name);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopyCode = () => {
    if (company?.inviteCode) {
      navigator.clipboard.writeText(company.inviteCode);
      toast.success('✅ Invite code copied!');
    }
  };

  const handleSaveDomain = async () => {
    setIsSavingDomain(true);
    try {
      const updated = await masterApi.updateDomain({
        domain: domain.trim() || null,
      });
      setCompany(updated);
      toast.success(
        domain.trim()
          ? `✅ Domain set to @${domain.trim()}`
          : '✅ Domain restriction removed'
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSavingDomain(false);
    }
  };

  const handleSaveCompanyName = async () => {
    if (!companyName.trim()) {
      toast.error('Company name cannot be empty');
      return;
    }
    if (companyName.trim() === company?.name) {
      toast('No changes to save', { icon: 'ℹ️' });
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    try {
      const updated = await masterApi.updateCompanyName({
        name: companyName.trim(),
      });
      setCompany(updated);
      if (user) {
        updateUser({ ...user, companyName: updated.name });
      }
      toast.success(`✅ Company name updated to "${updated.name}"`);
      setIsEditingName(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSavingName(false);
    }
  };

  const handleRemoveUser = async (userId: number, userName: string) => {
    if (!window.confirm(`Remove ${userName} from the company?`)) return;
    try {
      await masterApi.removeUser(userId);
      setAdmins((prev) => prev.filter((a) => a.id !== userId));
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success(`✅ ${userName} has been removed.`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCompleteProject = async (projectId: number, projectName: string) => {
    if (!window.confirm(`Mark "${projectName}" as completed? All members will be freed.`)) return;
    try {
      await projectApi.completeProject(projectId);
      toast.success(`✅ Project "${projectName}" marked as completed!`);
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteProject = async (projectId: number, projectName: string) => {
    if (!window.confirm(`Delete project "${projectName}"? This cannot be undone.`)) return;
    try {
      await projectApi.deleteProject(projectId);
      toast.success(`✅ Project deleted!`);
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const activeProjects = projects.filter((p) => p.status === 'ACTIVE');
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED');

  return (
    <div className="space-y-8">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-primary-600/20 border border-purple-500/20 rounded-3xl p-6 sm:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-purple-400" />
            <span className="text-xs text-slate-400">{today}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {getGreeting()}, <span className="text-purple-400">{user?.name}</span>! 👑
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <Building2 size={14} />
            <span>{company?.name}</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs bg-purple-900/30 text-purple-400 border border-purple-700/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Crown size={10} /> Master Admin
            </span>
          </div>
          <p className="text-sm text-slate-400">
            <Sparkles size={14} className="inline text-yellow-400 mr-1" />
            Manage your company, projects, and team members.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Company', value: company?.name ?? '-', icon: <Building2 size={20} />, color: 'text-purple-400', bg: 'bg-purple-600/10', border: 'border-purple-700/40' },
          { label: 'Projects', value: projects.length, icon: <FolderKanban size={20} />, color: 'text-pink-400', bg: 'bg-pink-600/10', border: 'border-pink-700/40' },
          { label: 'Admins', value: company?.totalAdmins ?? 0, icon: <Shield size={20} />, color: 'text-yellow-400', bg: 'bg-yellow-600/10', border: 'border-yellow-700/40' },
          { label: 'Members', value: company?.totalUsers ?? 0, icon: <Users size={20} />, color: 'text-blue-400', bg: 'bg-blue-600/10', border: 'border-blue-700/40' },
          { label: 'Tasks', value: company?.totalTasks ?? 0, icon: <CheckCircle size={20} />, color: 'text-green-400', bg: 'bg-green-600/10', border: 'border-green-700/40' },
        ].map((stat) => (
          <div key={stat.label} className={`bg-slate-900/60 border ${stat.border} rounded-2xl p-4 hover:bg-slate-900 transition-all`}>
            <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`${typeof stat.value === 'number' ? 'text-2xl' : 'text-base'} font-bold ${stat.color} mt-1 truncate`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Projects Section */}
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-pink-600/20 rounded-lg flex items-center justify-center">
              <FolderKanban size={16} className="text-pink-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Projects</h2>
              <p className="text-xs text-slate-500">
                {activeProjects.length} active, {completedProjects.length} completed
              </p>
            </div>
          </div>
          <Button
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setIsCreateProjectOpen(true)}
          >
            New Project
          </Button>
        </div>

        <div className="p-6">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-pink-600/10 rounded-2xl mb-4">
                <FolderPlus size={28} className="text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No projects yet
              </h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto mb-4">
                Create your first project and assign admins and team members.
              </p>
              <Button
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={() => setIsCreateProjectOpen(true)}
              >
                Create First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`border rounded-xl p-5 transition-all ${
                    project.status === 'COMPLETED'
                      ? 'bg-green-950/20 border-green-700/40'
                      : 'bg-slate-800/40 border-slate-700/40 hover:border-pink-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        project.status === 'COMPLETED'
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-pink-600/20 text-pink-400'
                      }`}>
                        {project.status === 'COMPLETED' ? <Trophy size={18} /> : <FolderKanban size={18} />}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{project.name}</h3>
                        <code className="text-xs text-slate-500 font-mono">{project.code}</code>
                      </div>
                    </div>
                    {project.status === 'COMPLETED' ? (
                      <span className="text-xs bg-green-900/30 text-green-400 border border-green-700/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Trophy size={10} /> Completed
                      </span>
                    ) : (
                      <span className="text-xs bg-pink-900/30 text-pink-400 border border-pink-700/40 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>

                  {project.description && (
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Tasks</p>
                      <p className="text-sm font-bold text-slate-200">{project.totalTasks}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-slate-500 uppercase">Todo</p>
                      <p className="text-sm font-bold text-slate-300">{project.todoTasks}</p>
                    </div>
                    <div className="bg-blue-950/30 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-blue-500 uppercase">Active</p>
                      <p className="text-sm font-bold text-blue-400">{project.inProgressTasks}</p>
                    </div>
                    <div className="bg-green-950/30 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-green-500 uppercase">Done</p>
                      <p className="text-sm font-bold text-green-400">{project.doneTasks}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-400 mb-3">
                    <p>
                      <Shield size={10} className="inline text-yellow-400 mr-1" />
                      {project.admins.length} admin{project.admins.length !== 1 ? 's' : ''}
                    </p>
                    <p>
                      <Users size={10} className="inline text-blue-400 mr-1" />
                      {project.users.length} member{project.users.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {project.status === 'ACTIVE' && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-700/60">
                      <Button
                        size="sm"
                        variant="primary"
                        className="flex-1 min-w-[80px]"
                        leftIcon={<UserCog size={12} />}
                        onClick={() => setManagingProject(project)}
                      >
                        Manage
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 min-w-[80px]"
                        leftIcon={<Trophy size={12} />}
                        onClick={() => handleCompleteProject(project.id, project.name)}
                      >
                        Complete
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        leftIcon={<Trash2 size={12} />}
                        onClick={() => handleDeleteProject(project.id, project.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                  {project.status === 'COMPLETED' && (
                    <div className="pt-3 border-t border-slate-700/60">
                      <Button
                        size="sm"
                        variant="danger"
                        className="w-full"
                        leftIcon={<Trash2 size={12} />}
                        onClick={() => handleDeleteProject(project.id, project.name)}
                      >
                        Delete Project
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Company Settings */}
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60 flex items-center gap-2">
          <div className="h-8 w-8 bg-primary-600/20 rounded-lg flex items-center justify-center">
            <Settings size={16} className="text-primary-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Company Settings</h2>
            <p className="text-xs text-slate-500">Manage company info and access</p>
          </div>
        </div>

        <div className="p-6 space-y-6">

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={16} className="text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Company Name</h3>
            </div>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveCompanyName();
                    if (e.key === 'Escape') {
                      setCompanyName(company?.name ?? '');
                      setIsEditingName(false);
                    }
                  }}
                  className="flex-1 bg-slate-900 border border-purple-500/40 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button size="md" onClick={handleSaveCompanyName} isLoading={isSavingName} leftIcon={<Check size={14} />}>Save</Button>
                <Button size="md" variant="ghost" onClick={() => { setCompanyName(company?.name ?? ''); setIsEditingName(false); }} leftIcon={<X size={14} />} className="text-slate-400">Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-white">{company?.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <p className="text-lg font-bold text-white">{company?.name}</p>
                </div>
                <Button size="sm" variant="secondary" leftIcon={<Edit3 size={14} />} onClick={() => setIsEditingName(true)}>Edit</Button>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-primary-600/10 to-blue-600/10 border border-primary-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Key size={16} className="text-primary-400" />
              <h3 className="text-sm font-semibold text-white">Invite Code</h3>
            </div>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-slate-900/60 border-2 border-primary-500/30 rounded-xl px-5 py-3.5 text-2xl font-mono font-bold text-primary-400 tracking-widest text-center">
                {company?.inviteCode}
              </code>
              <Button variant="primary" size="md" leftIcon={<Copy size={14} />} onClick={handleCopyCode}>Copy</Button>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Globe size={16} className="text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Email Domain Restriction</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourcompany.com" className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <Button size="md" onClick={handleSaveDomain} isLoading={isSavingDomain}>Save</Button>
              {domain && <Button size="md" variant="ghost" onClick={() => setDomain('')} leftIcon={<XCircle size={14} />} className="text-red-400">Clear</Button>}
            </div>
          </div>
        </div>
      </div>

      {/* Admins */}
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60 flex items-center gap-2">
          <div className="h-8 w-8 bg-yellow-600/20 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Admins</h2>
            <p className="text-xs text-slate-500">{admins.length} admin{admins.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="p-6">
          {admins.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No admins yet</p>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-3 hover:border-yellow-500/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{admin.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{admin.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><Mail size={10} />{admin.email}</p>
                    </div>
                  </div>
                  <Button variant="danger" size="sm" leftIcon={<Trash2 size={13} />} onClick={() => handleRemoveUser(admin.id, admin.name)}>Remove</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Users */}
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60 flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <UserCog size={16} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Team Members</h2>
            <p className="text-xs text-slate-500">{users.length} member{users.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="p-6">
          {users.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No members yet</p>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-3 hover:border-blue-500/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-primary-600 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{u.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{u.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><Mail size={10} />{u.email}</p>
                    </div>
                  </div>
                  <Button variant="danger" size="sm" leftIcon={<Trash2 size={13} />} onClick={() => handleRemoveUser(u.id, u.name)}>Remove</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSuccess={fetchData}
      />

      {managingProject && (
        <ManageProjectMembersModal
          project={managingProject}
          isOpen={!!managingProject}
          onClose={() => setManagingProject(null)}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
};