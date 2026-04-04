import { defineStore } from 'pinia';
import * as addressesApi from 'src/services/AddressesAPI';
import type { Address, CreateAddressDto, UpdateAddressDto } from 'src/models/Address';
import { Notify } from 'quasar';

export const useAddressesStore = defineStore('addresses', {
  state: () => ({
    items: [] as Address[],
    current: null as Address | null,
    isLoading: false,
  }),

  actions: {
    async fetchAddresses() {
      this.isLoading = true;
      try {
        this.items = await addressesApi.getAddresses();
      } finally {
        this.isLoading = false;
      }
    },

    async fetchByEmployee(employeeId: string) {
      this.isLoading = true;
      try {
        const result = await addressesApi.getAddressByEmployee(employeeId);
        this.current = Array.isArray(result) ? (result[0] ?? null) : result;
      } finally {
        this.isLoading = false;
      }
    },

    async addAddress(payload: CreateAddressDto) {
      const dataToSend = { ...payload };
      delete dataToSend.full_address;
      const newAddress = await addressesApi.createAddress(dataToSend);
      this.items.push(newAddress);
      this.current = newAddress;
      Notify.create({ type: 'positive', message: 'Адрес регистрации добавлен' });
      return newAddress;
    },

    async editAddress(id: string, payload: UpdateAddressDto) {
      const dataToSend = { ...payload };
      delete dataToSend.full_address;

      const updatedAddress = await addressesApi.updateAddress(id, dataToSend);

      const index = this.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.items[index] = updatedAddress;
      }

      if (this.current?.id === id) {
        this.current = updatedAddress;
      }

      Notify.create({ type: 'positive', message: 'Адрес обновлен' });
      return updatedAddress;
    },

    async removeAddress(id: string) {
      await addressesApi.deleteAddress(id);
      this.items = this.items.filter((item) => item.id !== id);
      if (this.current?.id === id) this.current = null;

      Notify.create({ type: 'positive', message: 'Удалено' });
    },

    clearCurrent() {
      this.current = null;
    },
  },
});
