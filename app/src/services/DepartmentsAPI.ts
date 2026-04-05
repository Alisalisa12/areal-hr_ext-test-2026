import API from './API';
import type { Department, CreateDepartmentDto, UpdateDepartmentDto } from '../models/Department';

export async function getAllDepartments(): Promise<Department[]> {
  const { data } = await API.get<Department[]>('/departments');
  return data;
}

export const getDepartments = async (orgId: string): Promise<Department[]> => {
  const { data } = await API.get<Department[]>(`/departments/organization/${orgId}`);
  return data;
};

export const createDepartment = async (payload: CreateDepartmentDto) => {
  const { data } = await API.post<Department>('/departments', payload);
  return data;
};

export const updateDepartment = async (id: string, payload: UpdateDepartmentDto) => {
  const { data } = await API.patch<Department>(`/departments/${id}`, payload);
  return data;
};

export const deleteDepartment = async (id: string) => {
  await API.delete(`/departments/${id}`);
};
