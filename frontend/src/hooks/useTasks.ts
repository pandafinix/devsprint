import { useState, useCallback } from 'react';
import { taskApi, getErrorMessage } from '../services/api';
import type { Task, Status, CreateTaskRequest, UpdateTaskRequest } from '../types';
import toast from 'react-hot-toast';

interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (data: CreateTaskRequest) => Promise<Task | null>;
  updateTask: (id: number, data: UpdateTaskRequest) => Promise<Task | null>;
  updateTaskStatus: (id: number, status: Status) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await taskApi.getAllTasks();
      setTasks(data);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTask = useCallback(async (data: CreateTaskRequest): Promise<Task | null> => {
    try {
      const newTask = await taskApi.createTask(data);
      setTasks((prev) => [newTask, ...prev]);
      toast.success('Task created successfully!');
      return newTask;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return null;
    }
  }, []);

  const updateTask = useCallback(async (id: number, data: UpdateTaskRequest): Promise<Task | null> => {
    try {
      const updated = await taskApi.updateTask(id, data);
      setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
      toast.success('Task updated!');
      return updated;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return null;
    }
  }, []);

  const updateTaskStatus = useCallback(async (id: number, status: Status): Promise<void> => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, status } : task)));
    try {
      const updated = await taskApi.updateTaskStatus(id, { status });
      setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
      toast.success(`Moved to ${status.replace('_', ' ')}`);
    } catch (err) {
      await fetchTasks();
      toast.error(getErrorMessage(err));
    }
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: number): Promise<void> => {
    try {
      await taskApi.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, []);

  return { tasks, isLoading, error, fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask };
};