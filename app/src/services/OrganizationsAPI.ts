import API from './API';
import type {
  Organization,
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '../models/Organization';

export const getOrganizations = async (): Promise<Organization[]> => {
  const { data } = await API.get<Organization[]>('/organizations');
  return data;
};

export const createOrganization = async (payload: CreateOrganizationDto) => {
  const { data } = await API.post<Organization>('/organizations', payload);
  return data;
};

export const updateOrganization = async (id: string, payload: UpdateOrganizationDto) => {
  const { data } = await API.patch<Organization>(`/organizations/${id}`, payload);
  return data;
};

export const deleteOrganization = async (id: string) => {
  await API.delete(`/organizations/${id}`);
};
