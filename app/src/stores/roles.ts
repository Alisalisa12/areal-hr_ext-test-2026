import { defineStore } from 'pinia';
import * as rolesApi from 'src/services/RolesAPI';
import type { Role, CreateRoleDto, UpdateRoleDto } from 'src/models/Role';
import { Notify } from 'quasar';

export const useRolesStore = defineStore('roles', {
  state: () => ({
    items: [] as Role[],
    isLoading: false,
  }),

  getters: {
    count: (state) => state.items.length,
  },

  actions: {
    async fetchRoles() {
      this.isLoading = true;
      try {
        this.items = await rolesApi.getRoles();
      } finally {
        this.isLoading = false;
      }
    },

    async addRole(payload: CreateRoleDto) {
      const newRole = await rolesApi.createRole(payload);
      this.items.unshift(newRole);
      Notify.create({ type: 'positive', message: 'Роль успешно добавлена' });
    },

    async editRole(id: string, payload: UpdateRoleDto) {
      const updatedRole = await rolesApi.updateRole(id, payload);

      const index = this.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.items[index] = updatedRole;
      }
      Notify.create({ type: 'positive', message: 'Роль обновлена' });
    },

    async removeRole(id: string) {
      await rolesApi.deleteRole(id);
      this.items = this.items.filter((item) => item.id !== id);
      Notify.create({ type: 'positive', message: 'Роль удалена' });
    },
  },
});
