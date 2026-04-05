import { defineStore } from 'pinia';
import * as hrOperationsApi from 'src/services/HrOperationsAPI';
import type {
  HrOperation,
  CreateHrOperationDto,
  UpdateHrOperationDto
} from 'src/models/HrOperation';
import { Notify } from 'quasar';

export const useHrOperationsStore = defineStore('hr-operations', {
  state: () => ({
    items: [] as HrOperation[],
    isLoading: false,
  }),

  getters: {
    count: (state) => state.items.length,
  },

  actions: {
    async fetchHrOperations() {
      this.isLoading = true;
      try {
        this.items = await hrOperationsApi.getHrOperations();
      } finally {
        this.isLoading = false;
      }
    },

    async addHrOperation(payload: CreateHrOperationDto): Promise<HrOperation> {
      const newOp = await hrOperationsApi.createHrOperation(payload);
      this.items.push(newOp);
      return newOp;
    },

    async editHrOperation(id: string, payload: UpdateHrOperationDto) {
      const updatedOp = await hrOperationsApi.updateHrOperation(id, payload);
      const index = this.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.items[index] = updatedOp;
      }
    },

    async removeHrOperation(id: string) {
      await hrOperationsApi.deleteHrOperation(id);
      this.items = this.items.filter((item) => item.id !== id);
      Notify.create({ type: 'positive', message: 'Удалено' });
    },
  },
});
