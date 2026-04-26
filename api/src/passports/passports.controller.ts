import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UsePipes,
} from '@nestjs/common';
import { createPassportSchema, updatePassportSchema } from './Passports.schema';
import { PassportsService } from './passports.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { UpdatePassportDto } from './dto/update-passport.dto';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('passports')
export class PassportsController {
  constructor(private readonly passportsService: PassportsService) {}

  @Get()
  async getAll() {
    return this.passportsService.getAll();
  }

  @Get('employee/:employeeId')
  async getByEmployee(@Param('employeeId') employeeId: string) {
    return this.passportsService.getByEmployee(employeeId);
  }

  @Post()
  async create(
    @Body(new JoiValidationPipe(createPassportSchema))
    createDto: CreatePassportDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.passportsService.create(createDto, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updatePassportSchema))
    updateDto: UpdatePassportDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.passportsService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.passportsService.delete(id, userId);
  }
}
