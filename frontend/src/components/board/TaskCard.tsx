import React, { useState } from 'react';
import { PriorityBadge } from '../ui/Badge';
import type { Task, Status } from '../../types';
import { ChevronRight, Calendar, User, CheckCircle2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: number, status: Status) => Promise<void>;
  onEdit: (task: Task) => void;
}

const STATUS_TRANSITIONS: Record<Status, Status | null> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: null,
};

const STATUS_LABELS: Record<Status, string> = {
  TODO: 'Start Task',
  IN_PROGRESS: 'Mark Done',
  DONE: '',
};

const STATUS_COLORS: Record<Status, string> = {
  TODO: 'text-primary-400 hover:text-primary-300 bg-primary-600/10 hover:bg-primary-600/20',
  IN_PROGRESS: 'text-green-400 hover:text-green-300 bg-green-600/10 hover:bg-green-600/20',
  DONE: '',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onEdit }) => {
  const [isMoving, setIsMoving] = useState(false);
  const nextStatus = STATUS_TRANSITIONS[task.status];

  const handleMove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nextStatus || isMoving) return;
    setIsMoving(true);
    try { await onStatusChange(task.id, nextStatus); }
    finally { setIsMoving(false); }
  };

  const isDone = task.status === 'DONE';

  return (
    <div
      className={`
        group bg-slate-800/80 border border-slate-700/60 rounded-xl p-4
        hover:border-slate-500/60 hover:bg-slate-800 hover:shadow-lg
        hover:shadow-black/20 transition-all duration-200 cursor-pointer
        animate-fade-in
        ${isDone ? 'opacity-75' : ''}
      `}
      onClick={() => onEdit(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onEdit(task)}
    >
      {/* Top Row — Priority + Done Check */}
      <div className="flex items-start justify-between mb-3">
        <PriorityBadge priority={task.priority} />
        {isDone && (
          <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
        )}
      </div>

      {/* Title */}
      <h3 className={`
        text-sm font-semibold leading-snug mb-2 line-clamp-2
        ${isDone ? 'text-slate-400 line-through' : 'text-slate-100'}
      `}>
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Assigned By */}
      {task.createdByName && (
        <div className="flex items-center gap-1.5 text-slate-500 mb-3">
          <div className="h-5 w-5 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-primary-400">
              {task.createdByName.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-xs">
            By <span className="text-slate-400">{task.createdByName}</span>
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/60">

        {/* Date */}
        <div className="flex items-center gap-1.5 text-slate-500">
          <Calendar size={11} />
          <span className="text-xs">
            {new Date(task.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Move Button */}
        {nextStatus && (
          <button
            onClick={handleMove}
            disabled={isMoving}
            className={`
              flex items-center gap-1 text-xs font-medium
              px-2.5 py-1 rounded-lg transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${STATUS_COLORS[task.status]}
            `}
            aria-label={`Move task to ${nextStatus}`}
          >
            {isMoving ? (
              <span className="animate-pulse">Moving...</span>
            ) : (
              <>
                {STATUS_LABELS[task.status]}
                <ChevronRight size={12} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};