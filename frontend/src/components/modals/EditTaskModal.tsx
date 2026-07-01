import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Task, Priority, Status, UpdateTaskRequest, UserResponse } from '../../types';
import { X, Trash2 } from 'lucide-react';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: UpdateTaskRequest) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  companyUsers?: UserResponse[];
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task, isOpen, onClose, onUpdate, onDelete, companyUsers = [],
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [status, setStatus] = useState<Status>('TODO');
  const [assignedToId, setAssignedToId] = useState<number | undefined>();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setPriority(task.priority);
      setStatus(task.status);
      setAssignedToId(task.assignedToId ?? undefined);
      setTitleError('');
    }
  }, [task, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setTitleError('Title is required'); return; }
    setIsUpdating(true);
    try {
      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        projectId: task.projectId,
        assignedToId,
      });
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    setIsDeleting(true);
    try { await onDelete(task.id); onClose(); }
    finally { setIsDeleting(false); }
  };

  const selectClass = 'w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Edit Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="px-6 py-5 space-y-4">
          <Input
            label="Task Title *"
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(''); }}
            error={titleError}
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={selectClass}>
                <option value="LOW">🟢 Low</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="HIGH">🔴 High</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className={selectClass}>
                <option value="TODO">📋 To Do</option>
                <option value="IN_PROGRESS">⚡ In Progress</option>
                <option value="DONE">✅ Done</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Assign To</label>
            <select
              value={assignedToId ?? ''}
              onChange={(e) => setAssignedToId(e.target.value ? Number(e.target.value) : undefined)}
              className={selectClass}
            >
              <option value="">-- Unassigned --</option>
              {companyUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={handleDelete} isLoading={isDeleting}>Delete</Button>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isUpdating || isDeleting}>Cancel</Button>
              <Button type="submit" isLoading={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};