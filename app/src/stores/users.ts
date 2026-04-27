import { defineStore } from 'pinia';
import * as usersApi from 'src/services/UsersAPI';
import type { User, CreateUserDto, UpdateUserDto } from 'src/models/User';
import { Notify } from 'quasar';

export const useUsersStore = defineStore('users', {
  state: () => ({
    items: [] as User[],
    isLoading: false,
  }),

  getters: {
    count: (state) => state.items.length,
  },

  actions: {
    async fetchUsers() {
      this.isLoading = true;
      try {
        this.items = await usersApi.getUsers();
      } finally {
        this.isLoading = false;
      }
    },

    async addUser(payload: CreateUserDto) {
      const newUser = await usersApi.createUser(payload);
      this.items.unshift(newUser);
      Notify.create({ type: 'positive', message: 'Пользователь создан' });
    },

    async editUser(id: string, payload: UpdateUserDto) {
      const updatedUser = await usersApi.updateUser(id, payload);
      const index = this.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.items[index] = updatedUser;
      }
      Notify.create({ type: 'positive', message: 'Данные пользователя обновлены' });
    },

    async removeUser(id: string) {
      await usersApi.deleteUser(id);
      this.items = this.items.filter((item) => item.id !== id);
      Notify.create({ type: 'positive', message: 'Пользователь удален' });
    },
  },
});
