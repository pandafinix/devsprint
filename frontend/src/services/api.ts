import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  RegisterCompanyRequest,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateStatusRequest,
  UpdateProfileRequest,
  UpdateDomainRequest,
  UpdateCompanyRequest,
  ChangePasswordRequest,
  CreateProjectRequest,
  UpdateProjectMembersRequest,
  Project,
  UserResponse,
  Company,
  MessageResponse,
} from '../types';

const BASE_URL = 'http://localhost:8080';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('devsprint_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/api/auth/');
      if (!isAuthRoute) {
        localStorage.removeItem('devsprint_token');
        localStorage.removeItem('devsprint_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  registerCompany: async (data: RegisterCompanyRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register-company', data);
    return response.data;
  },
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/signup', data);
    return response.data;
  },
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },
  updateProfile: async (data: UpdateProfileRequest): Promise<UserResponse> => {
    const response = await api.put<UserResponse>('/api/auth/profile', data);
    return response.data;
  },
  changePassword: async (data: ChangePasswordRequest): Promise<MessageResponse> => {
    const response = await api.put<MessageResponse>('/api/auth/change-password', data);
    return response.data;
  },
};

export const projectApi = {
  getAllProjects: async (): Promise<Project[]> => {
    const response = await api.get<Project[]>('/api/projects');
    return response.data;
  },
  getProject: async (id: number): Promise<Project> => {
    const response = await api.get<Project>(`/api/projects/${id}`);
    return response.data;
  },
  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await api.post<Project>('/api/projects', data);
    return response.data;
  },
  updateMembers: async (id: number, data: UpdateProjectMembersRequest): Promise<Project> => {
    const response = await api.put<Project>(`/api/projects/${id}/members`, data);
    return response.data;
  },
  completeProject: async (id: number): Promise<Project> => {
    const response = await api.post<Project>(`/api/projects/${id}/complete`);
    return response.data;
  },
  deleteProject: async (id: number): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/api/projects/${id}`);
    return response.data;
  },
  getAvailableUsers: async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>('/api/projects/available-users');
    return response.data;
  },
  getAllAdmins: async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>('/api/projects/admins');
    return response.data;
  },
  addUserToProject: async (projectId: number, userId: number): Promise<Project> => {
    const response = await api.post<Project>(`/api/projects/${projectId}/users/${userId}`);
    return response.data;
  },
  removeUserFromProject: async (projectId: number, userId: number): Promise<Project> => {
    const response = await api.delete<Project>(`/api/projects/${projectId}/users/${userId}`);
    return response.data;
  },
  addAdminToProject: async (projectId: number, adminId: number): Promise<Project> => {
    const response = await api.post<Project>(`/api/projects/${projectId}/admins/${adminId}`);
    return response.data;
  },
  removeAdminFromProject: async (projectId: number, adminId: number): Promise<Project> => {
    const response = await api.delete<Project>(`/api/projects/${projectId}/admins/${adminId}`);
    return response.data;
  },
};

export const taskApi = {
  getAllTasks: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>('/api/tasks');
    return response.data;
  },
  getTasksByProject: async (projectId: number): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/api/tasks/project/${projectId}`);
    return response.data;
  },
  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<Task>('/api/tasks', data);
    return response.data;
  },
  updateTask: async (id: number, data: UpdateTaskRequest): Promise<Task> => {
    const response = await api.put<Task>(`/api/tasks/${id}`, data);
    return response.data;
  },
  updateTaskStatus: async (id: number, data: UpdateStatusRequest): Promise<Task> => {
    const response = await api.patch<Task>(`/api/tasks/${id}/status`, data);
    return response.data;
  },
  deleteTask: async (id: number): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/api/tasks/${id}`);
    return response.data;
  },
  getProjectUsers: async (projectId: number): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>(`/api/tasks/project/${projectId}/users`);
    return response.data;
  },
  getAllCompanyUsers: async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>('/api/tasks/company/users');
    return response.data;
  },
};

export const masterApi = {
  getCompanyInfo: async (): Promise<Company> => {
    const response = await api.get<Company>('/api/master/company');
    return response.data;
  },
  updateCompanyName: async (data: UpdateCompanyRequest): Promise<Company> => {
    const response = await api.put<Company>('/api/master/company/name', data);
    return response.data;
  },
  updateDomain: async (data: UpdateDomainRequest): Promise<Company> => {
    const response = await api.put<Company>('/api/master/company/domain', data);
    return response.data;
  },
  getAdmins: async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>('/api/master/admins');
    return response.data;
  },
  getUsers: async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>('/api/master/users');
    return response.data;
  },
  removeUser: async (userId: number): Promise<void> => {
    await api.delete(`/api/master/users/${userId}`);
  },
};

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const status = error.response?.status;
    if (status === 401) return 'Invalid email or password.';
    if (status === 409) return 'Already exists.';
    if (status === 404) return 'Resource not found.';
    if (status === 403) return 'Access denied.';
    if (status === 400) {
      if (data?.errors) {
        const firstError = Object.values(data.errors)[0];
        if (typeof firstError === 'string') return firstError;
      }
      if (data?.detail) return data.detail;
    }
    if (data?.detail) return data.detail;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  return 'An unexpected error occurred.';
};

export default api;