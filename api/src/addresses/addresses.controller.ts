import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { createAddressSchema, updateAddressSchema } from './Addresses.schema';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  async getAll() {
    return this.addressesService.getAll();
  }

  @Get('employee/:employeeId')
  async getByEmployee(@Param('employeeId') employeeId: string) {
    return this.addressesService.getByEmployee(employeeId);
  }

  @Post()
  async create(
    @Body(new JoiValidationPipe(createAddressSchema))
    createDto: CreateAddressDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.addressesService.create(createDto, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateAddressSchema))
    updateDto: UpdateAddressDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.addressesService.update(id, updateDto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.addressesService.delete(id, userId);
  }
}
