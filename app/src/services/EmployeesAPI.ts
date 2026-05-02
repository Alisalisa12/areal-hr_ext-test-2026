import API from './API';
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '../models/Employee';

export const getEmployees = async (viewMode: string = 'active'): Promise<Employee[]> => {
  const { data } = await API.get<Employee[]>('/employees', {
    params: { viewMode }
  });
  return data;
};


export const createEmployee = async (payload: CreateEmployeeDto) => {
  const { data } = await API.post<Employee>('/employees', payload);
  return data;
};

export const updateEmployee = async (id: string, payload: UpdateEmployeeDto) => {
  const { data } = await API.patch<Employee>(`/employees/${id}`, payload);
  return data;
};

export const deleteEmployee = async (id: string) => {
  await API.delete(`/employees/${id}`);
};
