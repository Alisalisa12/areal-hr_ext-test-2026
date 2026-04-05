import { HrOperationType } from '../entities/hr_operation.entity';

export class UpdateHrOperationDto {
  employee_id?: string;
  department_id?: string;
  position_id?: string;
  type?: HrOperationType;
}
