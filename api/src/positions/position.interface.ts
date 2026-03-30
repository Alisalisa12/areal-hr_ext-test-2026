export interface Position {
  id: string;
  name: string;
  comment: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
