import React, { useEffect, useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';
import { KanbanColumnComponent } from './KanbanColumn';
import { EditTaskModal } from '../modals/EditTaskModal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import type { Task, Status, KanbanColumn, UpdateTaskRequest } from '../../types';
import {
  RefreshCw, Building2, Target, Zap, Trophy,
  Clock, ListTodo, TrendingUp, Calendar, Sparkles,
} from 'lucide-react';

const COLUMN_DEFINITIONS: Omit<KanbanColumn, 'tasks'>[] = [
  { id: 'TODO', title: 'To Do', color: 'text-slate-300', headerColor: 'border-slate-500' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'text-blue-300', headerColor: 'border-blue-500' },
  { id: 'DONE', title: 'Done', color: 'text-green-300', headerColor: 'border-green-500' },
];

export const KanbanBoard: React.FC = () => {
  const { user } = useAuth();
  const { tasks, isLoading, fetchTasks, updateTask, updateTaskStatus, deleteTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const columns: KanbanColumn[] = COLUMN_DEFINITIONS.map((col) => ({
    ...col,
    tasks: tasks.filter((task) => task.status === col.id),
  }));

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
    completionRate: tasks.length > 0
      ? Math.round((tasks.filter((t) => t.status === 'DONE').length / tasks.length) * 100)
      : 0,
    highPriority: tasks.filter((t) => t.priority === 'HIGH' && t.status !== 'DONE').length,
  };

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Motivational message based on progress
  const getMotivation = () => {
    if (stats.total === 0) return "Ready for your first task? 🚀";
    if (stats.completionRate === 100) return "Amazing! All tasks completed! 🎉";
    if (stats.completionRate >= 75) return "Almost there! Keep going! 💪";
    if (stats.completionRate >= 50) return "Halfway done! Great progress! 🔥";
    if (stats.completionRate >= 25) return "Good start! Stay focused! ⚡";
    return "Let's crush these tasks! 💯";
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* ─── Welcome Hero Section ─── */}
      <div className="relative bg-gradient-to-br from-primary-600/20 via-blue-600/10 to-purple-600/20 border border-primary-500/20 rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden">

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Left side */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} className="text-primary-400" />
              <span className="text-xs text-slate-400">{today}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {getGreeting()}, <span className="text-primary-400">{user?.name}</span>! 👋
            </h1>

            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Building2 size={14} />
              <span>{user?.companyName}</span>
              <span className="text-slate-600">•</span>
              <Sparkles size={14} className="text-yellow-400" />
              <span className="text-slate-300">{getMotivation()}</span>
            </div>
          </div>

          {/* Right side - Progress Circle */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                Completion Rate
              </p>
              <div className="flex items-center gap-2">
                <p className={`text-3xl font-bold ${
                  stats.completionRate >= 75 ? 'text-green-400' :
                  stats.completionRate >= 50 ? 'text-yellow-400' : 'text-primary-400'
                }`}>
                  {stats.completionRate}%
                </p>
                {stats.completionRate >= 75 && <Trophy size={20} className="text-yellow-400" />}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw size={14} />}
              onClick={fetchTasks}
              disabled={isLoading}
              className="text-slate-400 hover:text-white"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mt-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Overall Progress</span>
            <span>{stats.done} of {stats.total} tasks</span>
          </div>
          <div className="bg-slate-800/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 via-blue-500 to-green-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

        {/* Total */}
        <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 hover:border-slate-500/60 transition-all">
          <div className="bg-slate-700/50 text-slate-300 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
            <Target size={18} />
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-slate-200 mt-1">{stats.total}</p>
        </div>

        {/* To Do */}
        <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 hover:border-slate-500/60 transition-all">
          <div className="bg-slate-700/50 text-slate-400 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
            <ListTodo size={18} />
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">To Do</p>
          <p className="text-2xl font-bold text-slate-300 mt-1">{stats.todo}</p>
        </div>

        {/* In Progress */}
        <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 hover:border-blue-500/60 transition-all">
          <div className="bg-blue-600/10 text-blue-400 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
            <Clock size={18} />
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{stats.inProgress}</p>
        </div>

        {/* Done */}
        <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 hover:border-green-500/60 transition-all">
          <div className="bg-green-600/10 text-green-400 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
            <Trophy size={18} />
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Done</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{stats.done}</p>
        </div>

        {/* High Priority */}
        <div className={`bg-slate-900/60 border ${
          stats.highPriority > 0 ? 'border-red-500/40' : 'border-slate-700/60'
        } rounded-2xl p-4 hover:border-red-500/60 transition-all col-span-2 md:col-span-1`}>
          <div className={`${
            stats.highPriority > 0 ? 'bg-red-600/10 text-red-400' : 'bg-slate-700/50 text-slate-500'
          } w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
            <Zap size={18} />
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-wider">High Priority</p>
          <p className={`text-2xl font-bold mt-1 ${
            stats.highPriority > 0 ? 'text-red-400' : 'text-slate-500'
          }`}>
            {stats.highPriority}
          </p>
        </div>
      </div>

      {/* ─── Section Header ─── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-400" />
            My Sprint Board
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Track and update your assigned tasks
          </p>
        </div>

        {tasks.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              {stats.todo} Pending
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {stats.inProgress} Active
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {stats.done} Completed
            </span>
          </div>
        )}
      </div>

      {/* ─── Empty State ─── */}
      {tasks.length === 0 && !isLoading ? (
        <div className="bg-slate-900/40 border border-slate-700/40 border-dashed rounded-3xl p-12 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-primary-600/10 rounded-2xl mb-4">
            <Target size={32} className="text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No tasks assigned yet
          </h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Your admin will assign tasks to you soon. Check back later or
            contact your admin if you're expecting tasks.
          </p>
        </div>
      ) : (
        <>
          {/* ─── Kanban Columns ─── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
            {columns.map((column) => (
              <KanbanColumnComponent
                key={column.id}
                column={column}
                onStatusChange={async (taskId: number, status: Status) => {
                  await updateTaskStatus(taskId, status);
                }}
                onEditTask={(task: Task) => {
                  setSelectedTask(task);
                  setIsEditModalOpen(true);
                }}
                onAddTask={() => {}}
              />
            ))}
          </div>
        </>
      )}

      {/* Edit Modal */}
      <EditTaskModal
        task={selectedTask}
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedTask(null); }}
        onUpdate={async (id: number, data: UpdateTaskRequest) => { await updateTask(id, data); }}
        onDelete={async (id: number) => { await deleteTask(id); }}
        companyUsers={[]}
      />
    </div>
  );
};