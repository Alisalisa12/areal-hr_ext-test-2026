import { defineStore } from 'pinia';
import * as filesApi from 'src/services/FilesAPI';
import type { FileRecord } from 'src/models/FileRecord';
import { Notify } from 'quasar';

export const useFilesStore = defineStore('files', {
  state: () => ({
    items: [] as FileRecord[],
    isLoading: false,
  }),

  actions: {
    async fetchFiles() {
      this.isLoading = true;
      try {
        this.items = await filesApi.getFiles();
      } finally {
        this.isLoading = false;
      }
    },

    async fetchByEmployee(employeeId: string) {
      this.isLoading = true;
      try {
        this.items = await filesApi.getFilesByEmployee(employeeId);
      } finally {
        this.isLoading = false;
      }
    },

    async uploadFile(employeeId: string, categoryId: string, file: File) {
      const newFile = await filesApi.uploadFile(employeeId, categoryId, file);
      this.items.unshift(newFile);
      Notify.create({ type: 'positive', message: 'Файл загружен' });
    },

    downloadFile(id: string) {
      filesApi.downloadFile(id);
    },

    async removeFile(id: string) {
      await filesApi.deleteFile(id);
      this.items = this.items.filter((f) => f.id !== id);
      Notify.create({ type: 'positive', message: 'Файл удалён' });
    },
  },
});
