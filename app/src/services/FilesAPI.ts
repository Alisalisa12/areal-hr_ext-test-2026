import API from './API';
import type { FileRecord } from '../models/FileRecord';

export const getFiles = async (): Promise<FileRecord[]> => {
  const { data } = await API.get<FileRecord[]>('/files');
  return data;
};

export const getFilesByEmployee = async (employeeId: string): Promise<FileRecord[]> => {
  const { data } = await API.get<FileRecord[]>(`/files/employee/${employeeId}`);
  return data;
};

export const uploadFile = async (
  employeeId: string,
  categoryId: string,
  file: File,
): Promise<FileRecord> => {
  const formData = new FormData();
  formData.append('employee_id', employeeId);
  formData.append('category_id', categoryId);
  formData.append('file', file);

  const { data } = await API.post<FileRecord>('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const downloadFile = (id: string): void => {
  const base = (API.defaults.baseURL ?? '').replace(/\/$/, '');
  window.open(`${base}/files/${id}/download`, '_blank');
};

export const deleteFile = async (id: string): Promise<void> => {
  await API.delete(`/files/${id}`);
};
