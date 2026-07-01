import React from 'react';
import { TaskCard } from './TaskCard';
import type { Task, Status, KanbanColumn as KanbanColumnType } from '../../types';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onStatusChange: (taskId: number, status: Status) => Promise<void>;
  onEditTask: (task: Task) => void;
  onAddTask: (status: Status) => void;
}

const COLUMN_ICONS: Record<Status, string> = {
  TODO: '📋',
  IN_PROGRESS: '⚡',
  DONE: '✅',
};

const COLUMN_BG: Record<Status, string> = {
  TODO: 'bg-slate-800/40',
  IN_PROGRESS: 'bg-blue-950/20',
  DONE: 'bg-green-950/20',
};

export const KanbanColumnComponent: React.FC<KanbanColumnProps> = ({
  column,
  onStatusChange,
  onEditTask,
}) => (
  <div className="flex flex-col min-h-[500px] w-full">

    {/* Column Header */}
    <div
      className={`
        flex items-center justify-between px-4 py-3.5
        rounded-t-2xl border-t-2 ${column.headerColor}
        bg-slate-800/60 backdrop-blur-sm
      `}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-base">{COLUMN_ICONS[column.id]}</span>
        <span className={`text-sm font-bold ${column.color}`}>
          {column.title}
        </span>
        <span
          className="text-xs font-bold bg-slate-700/80 text-slate-300 
                     px-2 py-0.5 rounded-full min-w-[24px] text-center"
        >
          {column.tasks.length}
        </span>
      </div>
    </div>

    {/* Task List */}
    <div
      className={`
        flex-1 ${COLUMN_BG[column.id]}
        border border-t-0 border-slate-700/40 
        rounded-b-2xl p-3
        flex flex-col gap-3 min-h-[400px]
      `}
    >
      {column.tasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-3 opacity-40">
            {COLUMN_ICONS[column.id]}
          </div>
          <p className="text-slate-500 text-sm font-medium">
            {column.id === 'TODO' && 'No pending tasks'}
            {column.id === 'IN_PROGRESS' && 'Nothing in progress'}
            {column.id === 'DONE' && 'No completed tasks yet'}
          </p>
          <p className="text-slate-600 text-xs mt-1">
            {column.id === 'TODO' && 'You\'re all caught up!'}
            {column.id === 'IN_PROGRESS' && 'Start a task from To Do'}
            {column.id === 'DONE' && 'Keep going!'}
          </p>
        </div>
      ) : (
        column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onEdit={onEditTask}
          />
        ))
      )}
    </div>
  </div>
);