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
import { createAddressSchema, updateAddressSchema } from './Addresses.schema';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JoiValidationPipe } from '../shared/pipes/joi-validation.pipe';

@Controller('/addresses')
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
  @UsePipes(new JoiValidationPipe(createAddressSchema))
  async create(@Body() createDto: CreateAddressDto) {
    return this.addressesService.create(createDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateAddressSchema))
    updateDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.addressesService.delete(id);
  }
}
