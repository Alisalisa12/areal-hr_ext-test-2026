import API from './API';
import type { Passport, CreatePassportDto, UpdatePassportDto } from '../models/Passport';

export const getPassports = async (): Promise<Passport[]> => {
  const { data } = await API.get<Passport[]>('/passports');
  return data;
};

export const getPassportByEmployee = async (employeeId: string): Promise<Passport> => {
  const { data } = await API.get<Passport>(`/passports/employee/${employeeId}`);
  return data;
};

export const createPassport = async (payload: CreatePassportDto): Promise<Passport> => {
  const { data } = await API.post<Passport>('/passports', payload);
  return data;
};

export const updatePassport = async (id: string, payload: UpdatePassportDto): Promise<Passport> => {
  const { data } = await API.patch<Passport>(`/passports/${id}`, payload);
  return data;
};

export const deletePassport = async (id: string): Promise<void> => {
  await API.delete(`/passports/${id}`);
};
