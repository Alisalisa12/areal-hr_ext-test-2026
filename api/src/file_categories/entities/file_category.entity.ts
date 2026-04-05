export class FileCategoryEntity {
  id!: string;
  name!: string;
  comment?: string;
  created_at!: Date;
  updated_at!: Date;
  deleted_at!: Date | null;

  constructor(partial: Partial<FileCategoryEntity>) {
    Object.assign(this, partial);
  }
}
