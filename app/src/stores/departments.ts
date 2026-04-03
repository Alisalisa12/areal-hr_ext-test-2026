import { defineStore } from 'pinia';
import * as departmentsApi from 'src/services/DepartmentsAPI';
import type { Department, CreateDepartmentDto, UpdateDepartmentDto } from 'src/models/Department';
import { Notify } from 'quasar';

export const useDepartmentsStore = defineStore('departments', {
  state: () => ({
    items: [] as Department[],
    isLoading: false,
  }),

  getters: {
    count: (state) => state.items.length,
    byParentId: (state) => (parentId: string | null) =>
      state.items.filter((d) => d.parent_id === parentId),
  },

  actions: {
    async fetchByOrganization(orgId: string) {
      this.isLoading = true;
      try {
        this.items = await departmentsApi.getDepartments(orgId);
      } finally {
        this.isLoading = false;
      }
    },

    async addDepartment(payload: CreateDepartmentDto) {
      const newDept = await departmentsApi.createDepartment(payload);
      this.items.push(newDept);

      Notify.create({ type: 'positive', message: 'Департамент успешно добавлен' });
    },

    async editDepartment(id: string, payload: UpdateDepartmentDto) {
      const updatedDept = await departmentsApi.updateDepartment(id, payload);
      const index = this.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.items[index] = updatedDept;
      }
      Notify.create({ type: 'positive', message: 'Департамент обновлен' });
    },

    async removeDepartment(id: string) {
      await departmentsApi.deleteDepartment(id);
      this.items = this.items.filter((item) => item.id !== id);
      Notify.create({ type: 'positive', message: 'Департамент удален' });
    },
  },
});
