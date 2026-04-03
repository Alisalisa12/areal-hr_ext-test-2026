import { defineStore } from 'pinia';
import * as passportsApi from 'src/services/PassportsAPI';
import type { Passport, CreatePassportDto, UpdatePassportDto } from 'src/models/Passport';
import { Notify } from 'quasar';

export const usePassportsStore = defineStore('passports', {
  state: () => ({
    items: [] as Passport[],
    current: null as Passport | null,
    isLoading: false,
  }),

  actions: {
    async fetchPassports() {
      this.isLoading = true;
      try {
        this.items = await passportsApi.getPassports();
      } finally {
        this.isLoading = false;
      }
    },

    async fetchByEmployee(employeeId: string) {
      this.isLoading = true;
      try {
        this.current = await passportsApi.getPassportByEmployee(employeeId);
      } finally {
        this.isLoading = false;
      }
    },

    async addPassport(payload: CreatePassportDto) {
      const { full_passport, ...rest } = payload;
      const clean = (full_passport || '').replace(/\D/g, '');

      const dataToSend: CreatePassportDto = {
        ...rest,
        series: clean.slice(0, 4),
        number: clean.slice(4, 10),
      };

      delete dataToSend.full_passport;

      const newPassport = await passportsApi.createPassport(dataToSend);
      this.items.push(newPassport);
      Notify.create({ type: 'positive', message: 'Паспортные данные добавлены' });
      return newPassport;
    },

    async editPassport(id: string, payload: UpdatePassportDto) {
      const { full_passport, ...rest } = payload;
      const dataToSend: UpdatePassportDto = { ...rest };

      if (full_passport) {
        const clean = full_passport.replace(/\D/g, '');
        dataToSend.series = clean.slice(0, 4);
        dataToSend.number = clean.slice(4, 10);
      }

      delete dataToSend.full_passport;

      const updatedPassport = await passportsApi.updatePassport(id, dataToSend);
      const index = this.items.findIndex((item) => item.id === id);
      if (index !== -1) this.items[index] = updatedPassport;
      if (this.current?.id === id) this.current = updatedPassport;

      Notify.create({ type: 'positive', message: 'Данные паспорта обновлены' });
      return updatedPassport;
    },

    async removePassport(id: string) {
      await passportsApi.deletePassport(id);
      this.items = this.items.filter((item) => item.id !== id);
      if (this.current?.id === id) this.current = null;
      Notify.create({ type: 'positive', message: 'Удалено' });
    },

    clearCurrent() {
      this.current = null;
    },
  },
});
