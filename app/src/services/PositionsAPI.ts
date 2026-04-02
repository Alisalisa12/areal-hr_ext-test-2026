import API from './API';
import type { Position, CreatePositionDto, UpdatePositionDto } from '../models/Position';

export const getPositions = async (): Promise<Position[]> => {
  const { data } = await API.get<Position[]>('/positions');
  return data;
};

export const createPosition = async (payload: CreatePositionDto) => {
  const { data } = await API.post<Position>('/positions', payload);
  return data;
};

export const updatePosition = async (id: string, payload: UpdatePositionDto) => {
  const { data } = await API.patch<Position>(`/positions/${id}`, payload);
  return data;
};

export const deletePosition = async (id: string) => {
  await API.delete(`/positions/${id}`);
};
