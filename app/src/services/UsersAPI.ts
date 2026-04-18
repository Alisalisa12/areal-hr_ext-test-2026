import API from './API';
import type { User, CreateUserDto, UpdateUserDto } from '../models/User';

export const getUsers = async (): Promise<User[]> => {
  const { data } = await API.get<User[]>('/users');
  return data;
};

export const getUserById = async (id: string): Promise<User> => {
  const { data } = await API.get<User>(`/users/${id}`);
  return data;
};

export const createUser = async (payload: CreateUserDto) => {
  const { data } = await API.post<User>('/users', payload);
  return data;
};

export const updateUser = async (id: string, payload: UpdateUserDto) => {
  const { data } = await API.patch<User>(`/users/${id}`, payload);
  return data;
};

export const deleteUser = async (id: string) => {
  await API.delete(`/users/${id}`);
};
