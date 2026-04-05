import API from './API';
import type {
  HrOperation,
  CreateHrOperationDto,
  UpdateHrOperationDto
} from '../models/HrOperation';

export const getHrOperations = async (): Promise<HrOperation[]> => {
  const { data } = await API.get<HrOperation[]>('/hr-operations');
  return data;
};

export const createHrOperation = async (payload: CreateHrOperationDto) => {
  const { data } = await API.post<HrOperation>('/hr-operations', payload);
  return data;
};

export const updateHrOperation = async (id: string, payload: UpdateHrOperationDto) => {
  const { data } = await API.patch<HrOperation>(`/hr-operations/${id}`, payload);
  return data;
};

export const deleteHrOperation = async (id: string) => {
  await API.delete(`/hr-operations/${id}`);
};
