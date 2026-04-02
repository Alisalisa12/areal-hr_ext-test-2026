export interface Position {
  id: string;
  name: string;
  comment: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export interface CreatePositionDto {
  name: string;
  comment?: string;
}

export type UpdatePositionDto = Partial<CreatePositionDto>;
