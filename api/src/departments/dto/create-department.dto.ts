export class CreateDepartmentDto {
  organization_id!: string;
  parent_id?: string | null;
  name!: string;
  comment?: string;
}
