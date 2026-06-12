import { apiClient } from './client'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email?: string
  nickname?: string
}

export interface User {
  id: number
  username: string
  email?: string
  nickname?: string
  avatar?: string
  role: string
  roleLabel: string
  isActive: boolean
  bio?: string
  createdAt: string
}

export interface LoginResponse {
  token: string
  user: User
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/api/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<User>('/api/auth/register', data),
}

export const userApi = {
  getCurrentUser: () =>
    apiClient.get<User>('/api/users/me'),

  updateCurrentUser: (data: Partial<User>) =>
    apiClient.put<User>('/api/users/me', data),

  getAllUsers: () =>
    apiClient.get<User[]>('/api/users'),

  getUserById: (id: number) =>
    apiClient.get<User>(`/api/users/${id}`),

  updateUserRole: (id: number, role: string) =>
    apiClient.put<User>(`/api/users/${id}/role?role=${role}`),

  toggleUserStatus: (id: number) =>
    apiClient.put<User>(`/api/users/${id}/status`),
}