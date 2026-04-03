import { defineStore } from 'pinia';
import * as organizationsApi from 'src/services/OrganizationsAPI';
import type {
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from 'src/models/Organization';
import { Notify } from 'quasar';

export const useOrganizationsStore = defineStore('organizations', {
  state: () => ({
    items: [] as Organization[],
    isLoading: false,
  }),

  getters: {
    count: (state) => state.items.length,
  },

  actions: {
    async fetchOrganizations() {
      this.isLoading = true;
      try {
        this.items = await organizationsApi.getOrganizations();
      } finally {
        this.isLoading = false;
      }
    },

    async addOrganization(payload: CreateOrganizationDto) {
      const newOrg = await organizationsApi.createOrganization(payload);
      this.items.push(newOrg);

      Notify.create({ type: 'positive', message: 'Организация успешно добавлена' });
    },

    async editOrganization(id: string, payload: UpdateOrganizationDto) {
      const updatedOrg = await organizationsApi.updateOrganization(id, payload);
      const index = this.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.items[index] = updatedOrg;
      }
      Notify.create({ type: 'positive', message: 'Обновлено' });
    },

    async removeOrganization(id: string) {
      await organizationsApi.deleteOrganization(id);
      this.items = this.items.filter((item) => item.id !== id);
      Notify.create({ type: 'positive', message: 'Удалено' });
    },
  },
});
