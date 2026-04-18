import API from './API';
import type { Role, CreateRoleDto, UpdateRoleDto } from '../models/Role';

export const getRoles = async (): Promise<Role[]> => {
  const { data } = await API.get<Role[]>('/roles');
  return data;
};

export const createRole = async (payload: CreateRoleDto) => {
  const { data } = await API.post<Role>('/roles', payload);
  return data;
};

export const updateRole = async (id: string, payload: UpdateRoleDto) => {
  const { data } = await API.patch<Role>(`/roles/${id}`, payload);
  return data;
};

export const deleteRole = async (id: string) => {
  await API.delete(`/roles/${id}`);
};
