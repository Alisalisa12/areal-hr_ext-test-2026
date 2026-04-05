import { defineStore } from 'pinia';
import * as auditLogApi from 'src/services/AuditLogAPI';
import type {
  AuditLog,
  CreateAuditLogDto,
} from 'src/models/AuditLog';

export const useAuditLogStore = defineStore('audit-logs', {
  state: () => ({
    items: [] as AuditLog[],
    isLoading: false,
  }),

  getters: {
    count: (state) => state.items.length,
  },

  actions: {
    async fetchAuditLogs() {
      this.isLoading = true;
      try {
        this.items = await auditLogApi.getAuditLogs();
      } finally {
        this.isLoading = false;
      }
    },

    async addAuditLog(payload: CreateAuditLogDto): Promise<AuditLog> {
      const newLog = await auditLogApi.createAuditLog(payload);
      this.items.push(newLog);
      return newLog;
    },
  },
});
