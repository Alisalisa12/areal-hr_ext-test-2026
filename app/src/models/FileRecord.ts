export interface FileRecord {
  id: string;
  employee_id: string;
  category_id: string;
  name: string;
  storage_path: string;
  mime_type: string;
  created_at: string;
  deleted_at: string | null;
}
