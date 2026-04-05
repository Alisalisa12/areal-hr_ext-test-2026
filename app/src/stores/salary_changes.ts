import * as salaryApi from '../services/SalaryChanges';
import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import type { SalaryChange, CreateSalaryChangeDto, UpdateSalaryChangeDto } from 'src/models/SalaryChange';

export const useSalaryStore = defineStore('salary', {
  state: () => ({
    items: [] as SalaryChange[],
    isLoading: false,
  }),

  getters: {
    count: (state) => state.items.length,
  },

  actions: {
    async fetchSalaryChanges() {
      this.isLoading = true;
      try {
        this.items = await salaryApi.getSalaryChanges();
      } finally {
        this.isLoading = false;
      }
    },

    async addSalaryChange(payload: CreateSalaryChangeDto) {
      const newEntry = await salaryApi.createSalaryChange(payload);
      this.items.push(newEntry);
    },

    async editSalaryChange(id: string, payload: UpdateSalaryChangeDto) {
      const updatedEntry = await salaryApi.updateSalaryChange(id, payload);
      const index = this.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.items[index] = updatedEntry;
      }
    },

    async removeSalaryChange(id: string) {
      await salaryApi.deleteSalaryChange(id);
      this.items = this.items.filter((item) => item.id !== id);
      Notify.create({ type: 'positive', message: 'Запись удалена' });
    },
  },
});
