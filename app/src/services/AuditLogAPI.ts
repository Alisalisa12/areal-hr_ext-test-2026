import API from './API';
import type {
  AuditLog,
  CreateAuditLogDto,
  UpdateAuditLogDto
} from '../models/AuditLog';

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const { data } = await API.get<AuditLog[]>('/audit-logs');
  return data;
};

export const createAuditLog = async (payload: CreateAuditLogDto) => {
  const { data } = await API.post<AuditLog>('/audit-logs', payload);
  return data;
};

export const updateAuditLog = async (id: string, payload: UpdateAuditLogDto) => {
  const { data } = await API.patch<AuditLog>(`/audit-logs/${id}`, payload);
  return data;
};

export const deleteAuditLog = async (id: string) => {
  await API.delete(`/audit-logs/${id}`);
};
