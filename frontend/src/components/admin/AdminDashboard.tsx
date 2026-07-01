import React, { useEffect, useState, useCallback } from 'react';
import { taskApi, projectApi, getErrorMessage } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import type { Task, Project, UserResponse } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { ProjectDetailModal } from './ProjectDetailModal';
import {
  RefreshCw, Building2, Sparkles, Calendar, FolderKanban,
  CheckCircle, Clock, ListTodo, BarChart3, Plus, Users, Trophy,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [companyUsers, setCompanyUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projectsData, tasksData, usersData] = await Promise.all([
        projectApi.getAllProjects(),
        taskApi.getAllTasks(),
        taskApi.getAllCompanyUsers(),
      ]);
      setProjects(projectsData);
      setTasks(tasksData);
      setCompanyUsers(usersData);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
  };

  return (
    <div className="space-y-8">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-yellow-600/15 via-orange-600/10 to-primary-600/15 border border-yellow-500/20 rounded-3xl p-6 sm:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-yellow-400" />
              <span className="text-xs text-slate-400">{today}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {getGreeting()}, <span className="text-yellow-400">{user?.name}</span>! ⚡
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Building2 size={14} />
              <span>{user?.companyName}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs bg-yellow-900/30 text-yellow-400 border border-yellow-700/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} /> Admin
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            onClick={fetchData}
            className="text-slate-400 hover:text-white"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: stats.total, icon: <BarChart3 size={18} />, color: 'text-slate-300', bg: 'bg-slate-700/50' },
          { label: 'To Do', value: stats.todo, icon: <ListTodo size={18} />, color: 'text-slate-400', bg: 'bg-slate-700/50' },
          { label: 'In Progress', value: stats.inProgress, icon: <Clock size={18} />, color: 'text-blue-400', bg: 'bg-blue-600/10' },
          { label: 'Done', value: stats.done, icon: <CheckCircle size={18} />, color: 'text-green-400', bg: 'bg-green-600/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4">
            <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* All Team Members */}
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60 flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <Users size={16} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">All Team Members</h2>
            <p className="text-xs text-slate-500">
              {companyUsers.length} member{companyUsers.length !== 1 ? 's' : ''} in {user?.companyName}
            </p>
          </div>
        </div>

        <div className="p-6">
          {companyUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center h-14 w-14 bg-blue-600/10 rounded-2xl mb-3">
                <Users size={24} className="text-blue-400" />
              </div>
              <p className="text-slate-400 text-sm font-medium">No team members yet</p>
              <p className="text-slate-500 text-xs mt-1">
                Ask master admin to share invite code
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {companyUsers.map((u) => {
                const userTasks = tasks.filter((t) => t.assignedToId === u.id);
                const doneTasks = userTasks.filter((t) => t.status === 'DONE').length;
                const completion = userTasks.length > 0
                  ? Math.round((doneTasks / userTasks.length) * 100)
                  : 0;
                return (
                  <div
                    key={u.id}
                    className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4 hover:border-blue-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-primary-600 flex items-center justify-center shadow-lg">
                        <span className="text-sm font-bold text-white">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                      {completion === 100 && userTasks.length > 0 && (
                        <Trophy size={14} className="text-yellow-400 flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400">Tasks: {userTasks.length}</span>
                      <span className="text-green-400">Done: {doneTasks}</span>
                    </div>

                    {userTasks.length > 0 && (
                      <div className="bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-green-500 h-full rounded-full transition-all"
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* My Projects */}
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/60 flex items-center gap-2">
          <div className="h-8 w-8 bg-pink-600/20 rounded-lg flex items-center justify-center">
            <FolderKanban size={16} className="text-pink-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">My Projects</h2>
            <p className="text-xs text-slate-500">
              {projects.length} project{projects.length !== 1 ? 's' : ''} assigned to you
            </p>
          </div>
        </div>

        <div className="p-6">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-pink-600/10 rounded-2xl mb-4">
                <FolderKanban size={28} className="text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                No projects assigned yet
              </h3>
              <p className="text-sm text-slate-400">
                Wait for master admin to assign you to a project.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onRefresh={fetchData}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Project Card Component
// ─────────────────────────────────────────────
interface ProjectCardProps {
  project: Project;
  onRefresh: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5 hover:border-pink-500/30 transition-all cursor-pointer"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center">
              <FolderKanban size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{project.name}</h3>
              <code className="text-xs text-slate-500 font-mono">{project.code}</code>
            </div>
          </div>
          <Button size="sm" variant="primary" leftIcon={<Plus size={12} />}>
            Open
          </Button>
        </div>

        {project.description && (
          <p className="text-xs text-slate-400 mb-3 line-clamp-2">{project.description}</p>
        )}

        <div className="grid grid-cols-4 gap-2">
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

        <div className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-700/60">
          {project.users.length} team member{project.users.length !== 1 ? 's' : ''} • Click to manage
        </div>
      </div>

      <ProjectDetailModal
        project={project}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onRefresh={onRefresh}
      />
    </>
  );
};