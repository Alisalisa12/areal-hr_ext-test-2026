import API from './API';
import type { FileCategoryEntity } from '../models/FileCategory';

export interface CreateFileCategoryDto {
  name: string;
  comment?: string;
}

export type UpdateFileCategoryDto = Partial<CreateFileCategoryDto>;

export const getFileCategories = async (): Promise<FileCategoryEntity[]> => {
  const { data } = await API.get<FileCategoryEntity[]>('/file-categories');
  return data;
};

export const createFileCategory = async (payload: CreateFileCategoryDto) => {
  const { data } = await API.post<FileCategoryEntity>('/file-categories', payload);
  return data;
};

export const updateFileCategory = async (id: string, payload: UpdateFileCategoryDto) => {
  const { data } = await API.patch<FileCategoryEntity>(`/file-categories/${id}`, payload);
  return data;
};

export const deleteFileCategory = async (id: string) => {
  await API.delete(`/file-categories/${id}`);
};
