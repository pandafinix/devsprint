export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Role = 'MASTER_ADMIN' | 'ADMIN' | 'USER';
export type ProjectStatus = 'ACTIVE' | 'COMPLETED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  companyId?: number;
  companyName?: string;
  inviteCode?: string;
}

export interface Company {
  id: number;
  name: string;
  domain: string | null;
  inviteCode: string;
  isActive: boolean;
  totalAdmins: number;
  totalUsers: number;
  totalTasks: number;
}

export interface Project {
  id: number;
  name: string;
  code: string;
  description: string | null;
  status: ProjectStatus;
  companyId: number;
  admins: UserResponse[];
  users: UserResponse[];
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  companyId: number;
  projectId: number;
  projectName: string;
  projectCode: string;
  createdById: number;
  createdByName: string;
  assignedToId: number | null;
  assignedToName: string | null;
  assignedToEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  inviteCode: string;
  role: Role;
}

export interface RegisterCompanyRequest {
  companyName: string;
  name: string;
  email: string;
  password: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  projectId: number;
  assignedToId?: number;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  projectId: number;
  assignedToId?: number;
}

export interface UpdateStatusRequest {
  status: Status;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
}

export interface UpdateDomainRequest {
  domain: string | null;
}

export interface UpdateCompanyRequest {
  name: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  adminIds: number[];
  userIds: number[];
}

export interface UpdateProjectMembersRequest {
  adminIds: number[];
  userIds: number[];
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  name: string;
  email: string;
  role: Role;
  companyId: number;
  companyName: string;
  inviteCode: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  token?: string;
  companyId?: number;
  companyName?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

export interface KanbanColumn {
  id: Status;
  title: string;
  color: string;
  headerColor: string;
  tasks: Task[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
  updateUser: (user: User, token?: string) => void;
}