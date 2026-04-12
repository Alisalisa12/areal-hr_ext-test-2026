import { defineStore } from 'pinia';
import * as employeesApi from 'src/services/EmployeesAPI';
import type { Employee, CreateEmployeeDto, UpdateEmployeeDto } from 'src/models/Employee';
import { Notify } from 'quasar';

export const useEmployeesStore = defineStore('employees', {
  state: () => ({
    items: [] as Employee[],
    isLoading: false,
  }),

  getters: {
    count: (state) => state.items.length,
  },

  actions: {
    async fetchEmployees() {
      this.isLoading = true;
      try {
        this.items = await employeesApi.getEmployees();
      } finally {
        this.isLoading = false;
      }
    },

    async addEmployee(payload: CreateEmployeeDto) {
      const newEmp = await employeesApi.createEmployee(payload);
      this.items.unshift(newEmp);

      Notify.create({ type: 'positive', message: 'Сотрудник успешно добавлен' });
    },

    async editEmployee(id: string, payload: UpdateEmployeeDto) {
      const updatedEmp = await employeesApi.updateEmployee(id, payload);
      const index = this.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.items[index] = updatedEmp;
      }
      Notify.create({ type: 'positive', message: 'Информация обновлена' });
    },

    async removeEmployee(id: string) {
      await employeesApi.deleteEmployee(id);
      this.items = this.items.filter((item) => item.id !== id);
      Notify.create({ type: 'positive', message: 'Сотрудник удален' });
    },
  },
});
