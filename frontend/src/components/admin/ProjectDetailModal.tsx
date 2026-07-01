import React, { useState, useEffect, useCallback } from 'react';
import { taskApi, getErrorMessage } from '../../services/api';
import { Button } from '../ui/Button';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AdminCreateTaskModal } from './AdminCreateTaskModal';
import { EditTaskModal } from '../modals/EditTaskModal';
import type { Project, Task, UserResponse, CreateTaskRequest, UpdateTaskRequest } from '../../types';
import { X, Plus, FolderKanban, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProjectDetailModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project, isOpen, onClose, onRefresh,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectUsers, setProjectUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const fetchData = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);
    try {
      const [tasksData, usersData] = await Promise.all([
        taskApi.getTasksByProject(project.id),
        taskApi.getProjectUsers(project.id),
      ]);
      setTasks(tasksData);
      setProjectUsers(usersData);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, project.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isCreateOpen && !editTask) onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isCreateOpen, editTask]);

  const handleCreateTask = async (data: CreateTaskRequest) => {
    try {
      const newTask = await taskApi.createTask(data);
      setTasks((prev) => [newTask, ...prev]);
      toast.success('✅ Task created!');
      onRefresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleUpdateTask = async (id: number, data: UpdateTaskRequest) => {
    try {
      const updated = await taskApi.updateTask(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success('✅ Task updated!');
      onRefresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await taskApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success('✅ Task deleted!');
      onRefresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-pink-600/20 rounded-xl flex items-center justify-center">
                <FolderKanban size={20} className="text-pink-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{project.name}</h2>
                <code className="text-xs text-slate-500 font-mono">{project.code}</code>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setIsCreateOpen(true)}>
                New Task
              </Button>
              <Button size="sm" variant="ghost" leftIcon={<RefreshCw size={14} />} onClick={fetchData} className="text-slate-400">
                Refresh
              </Button>
              <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Team */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Users size={14} className="text-blue-400" />
                Team ({projectUsers.length})
              </h3>
              {projectUsers.length === 0 ? (
                <p className="text-xs text-yellow-400">⚠ No team members in this project</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {projectUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-2 bg-slate-900/50 border border-slate-700/40 rounded-lg px-3 py-1.5">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-600 to-primary-600 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{u.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="text-xs text-slate-200">{u.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks */}
            {isLoading ? (
              <div className="text-center py-12">
                <LoadingSpinner />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm">No tasks yet</p>
                <Button className="mt-4" size="sm" leftIcon={<Plus size={14} />} onClick={() => setIsCreateOpen(true)}>
                  Create First Task
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setEditTask(task)}
                    className="flex items-center justify-between bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-3 hover:border-slate-500/60 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {task.assignedToName ? (
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-white">{task.assignedToName.charAt(0).toUpperCase()}</span>
                        </div>
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-slate-500">?</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${task.status === 'DONE' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {task.assignedToName ? <>Assigned to <span className="text-primary-400">{task.assignedToName}</span></> : <span className="text-yellow-400">⚠ Unassigned</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AdminCreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateTask}
        companyUsers={projectUsers}
        projectId={project.id}
      />

      <EditTaskModal
        task={editTask}
        isOpen={!!editTask}
        onClose={() => setEditTask(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        companyUsers={projectUsers}
      />
    </>
  );
};