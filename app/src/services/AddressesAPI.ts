import API from './API';
import type { Address, CreateAddressDto, UpdateAddressDto } from '../models/Address';

export const getAddresses = async (): Promise<Address[]> => {
  const { data } = await API.get<Address[]>('/addresses');
  return data;
};

export const getAddressByEmployee = async (employeeId: string): Promise<Address> => {
  const { data } = await API.get<Address>(`/addresses/employee/${employeeId}`);
  return data;
};

export const createAddress = async (payload: CreateAddressDto): Promise<Address> => {
  const { data } = await API.post<Address>('/addresses', payload);
  return data;
};

export const updateAddress = async (id: string, payload: UpdateAddressDto): Promise<Address> => {
  const { data } = await API.patch<Address>(`/addresses/${id}`, payload);
  return data;
};

export const deleteAddress = async (id: string): Promise<void> => {
  await API.delete(`/addresses/${id}`);
};
