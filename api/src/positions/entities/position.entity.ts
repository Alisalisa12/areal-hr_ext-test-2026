export class PositionEntity {
  id!: string;
  name!: string;
  comment!: string | null;
  created_at!: Date;
  updated_at!: Date;
  deleted_at!: Date | null;

  constructor(partial: Partial<PositionEntity>) {
    Object.assign(this, partial);
  }
}
