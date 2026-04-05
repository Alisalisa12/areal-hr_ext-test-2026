import { PartialType } from '@nestjs/mapped-types';
import { CreateSalaryChangeDto } from './create-salary_change.dto';

export class UpdateSalaryChangeDto extends PartialType(CreateSalaryChangeDto) {}
