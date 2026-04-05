export class FileEntity {
  id!: string;
  employee_id!: string;
  category_id!: string;
  name!: string;
  storage_path!: string;
  mime_type!: string;
  created_at!: Date;
  deleted_at!: Date | null;

  constructor(partial: Partial<FileEntity>) {
    Object.assign(this, partial);
  }
}
