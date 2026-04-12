import { defineStore } from 'pinia';
import * as positionsApi from 'src/services/PositionsAPI';
import type { Position, CreatePositionDto, UpdatePositionDto } from 'src/models/Position';
import { Notify } from 'quasar';

export const usePositionsStore = defineStore('positions', {
  state: () => ({
    items: [] as Position[],
    isLoading: false,
  }),

  getters: {
    count: (state) => state.items.length,
  },

  actions: {
    async fetchPositions() {
      this.isLoading = true;
      try {
        this.items = await positionsApi.getPositions();
      } finally {
        this.isLoading = false;
      }
    },

    async addPosition(payload: CreatePositionDto) {
      const newPos = await positionsApi.createPosition(payload);
      this.items.unshift(newPos); 
      Notify.create({ type: 'positive', message: 'Позиция успешно добавлена' });
    },

    async editPosition(id: string, payload: UpdatePositionDto) {
      const updatedPos = await positionsApi.updatePosition(id, payload);
      const index = this.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.items[index] = updatedPos;
      }
      Notify.create({ type: 'positive', message: 'Обновлено' });
    },

    async removePosition(id: string) {
      await positionsApi.deletePosition(id);
      this.items = this.items.filter((item) => item.id !== id);
      Notify.create({ type: 'positive', message: 'Удалено' });
    },
  },
});
