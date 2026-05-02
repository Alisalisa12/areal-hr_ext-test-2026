import API from './API';
import type { AuditLog } from '../models/AuditLog';

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const { data } = await API.get<AuditLog[]>('/audit-logs');
  return data;
};
