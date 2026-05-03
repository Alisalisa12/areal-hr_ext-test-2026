import { defineStore } from 'pinia';
import * as employeesApi from 'src/services/EmployeesAPI';
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto } from 'src/models/Employee';
import { Notify } from 'quasar';

export const useEmployeesStore = defineStore('employees', {
  state: () => ({
    items: [] as Employee[],
    isLoading: false,
    viewMode: 'active' as 'active' | 'dismissed' | 'all',
  }),

  getters: {
    count: (state) => state.items.length,
  },

  actions: {
    async fetchEmployees() {
      this.isLoading = true;
      try {
        this.items = await employeesApi.getEmployees(this.viewMode);
      } finally {
        this.isLoading = false;
      }
    },

    async addEmployee(payload: CreateEmployeeDto) {
      const newEmp = await employeesApi.createEmployee(payload);
      this.items.unshift(newEmp);

      Notify.create({ type: 'positive', message: 'Сотрудник успешно добавлен' });
      return newEmp;
    },

    async editEmployee(id: string, payload: UpdateEmployeeDto) {
      const updatedEmp = await employeesApi.updateEmployee(id, payload);
      const index = this.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.items[index] = updatedEmp;
      }
      Notify.create({ type: 'positive', message: 'Информация обновлена' });
    },

    async setViewMode(mode: 'active' | 'dismissed' | 'all') {
      this.viewMode = mode;
      await this.fetchEmployees();
    },

    async dismissEmployee(id: string) {
      await employeesApi.deleteEmployee(id);
      const index = this.items.findIndex((i) => i.id === id);
      if (index !== -1) {
        const employee = this.items[index];
        if (this.viewMode === 'active') {
          this.items.splice(index, 1);
        } else if (employee) {
          employee.deleted_at = new Date().toISOString();
        }
      }
      Notify.create({ type: 'positive', message: 'Сотрудник уволен' });
    },
  },
});
