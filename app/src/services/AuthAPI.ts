import { api } from 'src/boot/axios';
import type { AuthUser } from 'src/models/User';

export async function login(login: string, password: string): Promise<AuthUser> {
  const { data } = await api.post<AuthUser>('/auth/login', { login, password });
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getProfile(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/profile');
  return data;
}
