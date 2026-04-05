import { defineStore } from 'pinia';
import * as fileCategoriesApi from 'src/services/FileCategoriesAPI';
import type {
  FileCategoryEntity,
  CreateFileCategoryDto,
  UpdateFileCategoryDto
} from 'src/models/FileCategory';
import { Notify } from 'quasar';

export const useFileCategoriesStore = defineStore('fileCategories', {
  state: () => ({
    items: [] as FileCategoryEntity[],
    isLoading: false,
  }),

  getters: {
    count: (state) => state.items.length,
  },

  actions: {
    async fetchCategories() {
      this.isLoading = true;
      try {
        this.items = await fileCategoriesApi.getFileCategories();
      } finally {
        this.isLoading = false;
      }
    },

    async addCategory(payload: CreateFileCategoryDto) {
      const newCategory = await fileCategoriesApi.createFileCategory(payload);
      this.items.push(newCategory);

      Notify.create({ type: 'positive', message: 'Категория успешно добавлена' });
    },

    async editCategory(id: string, payload: UpdateFileCategoryDto) {
      const updatedCategory = await fileCategoriesApi.updateFileCategory(id, payload);
      const index = this.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.items[index] = updatedCategory;
      }
      Notify.create({ type: 'positive', message: 'Категория обновлена' });
    },

    async removeCategory(id: string) {
      await fileCategoriesApi.deleteFileCategory(id);
      this.items = this.items.filter((item) => item.id !== id);
      Notify.create({ type: 'positive', message: 'Категория удалена' });
    },
  },
});
