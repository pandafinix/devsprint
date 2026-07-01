import React from 'react';
import type { Status, Priority } from '../../types';

interface StatusBadgeProps { status: Status; }

const statusConfig: Record<Status, { label: string; className: string }> = {
  TODO: { label: 'To Do', className: 'bg-slate-700 text-slate-300 border border-slate-600' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-900/50 text-blue-300 border border-blue-700' },
  DONE: { label: 'Done', className: 'bg-green-900/50 text-green-300 border border-green-700' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

interface PriorityBadgeProps { priority: Priority; }

const priorityConfig: Record<Priority, { label: string; className: string; dot: string }> = {
  LOW: { label: 'Low', className: 'bg-slate-700/50 text-slate-400', dot: 'bg-slate-400' },
  MEDIUM: { label: 'Medium', className: 'bg-yellow-900/40 text-yellow-400', dot: 'bg-yellow-400' },
  HIGH: { label: 'High', className: 'bg-red-900/40 text-red-400', dot: 'bg-red-400' },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const config = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};