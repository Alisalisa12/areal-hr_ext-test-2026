import API from './API';
import type {
  SalaryChange,
  CreateSalaryChangeDto,
  UpdateSalaryChangeDto
} from '../models/SalaryChange';

export const getSalaryChanges = async (): Promise<SalaryChange[]> => {
  const { data } = await API.get<SalaryChange[]>('/salary-changes');
  return data;
};

export const createSalaryChange = async (payload: CreateSalaryChangeDto) => {
  const { data } = await API.post<SalaryChange>('/salary-changes', payload);
  return data;
};

export const updateSalaryChange = async (id: string, payload: UpdateSalaryChangeDto) => {
  const { data } = await API.patch<SalaryChange>(`/salary-changes/${id}`, payload);
  return data;
};

export const deleteSalaryChange = async (id: string) => {
  await API.delete(`/salary-changes/${id}`);
};
