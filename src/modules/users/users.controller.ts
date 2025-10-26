import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { ResponseDto } from '@/helpers/util';
import { ChangePasswordDto, SetupWorklogDto, FindUserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.register(createUserDto);
  }

  @Get('get-all')
  async findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string
  ) {
    return await this.usersService.findAll(query, +current, +pageSize);
  }

  @Get('get-one/:id')
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiOkResponse({ type: ResponseDto<FindUserDto> })
  async findOne(@Param('id') id: string): Promise<ResponseDto<FindUserDto>> {
    return await this.usersService.findOneById(id);
  }

  @Get('get-setup-worklog/:id')
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiOkResponse({ type: ResponseDto<SetupWorklogDto> })
  async findSetupWorklogById(@Param('id') id: string): Promise<ResponseDto<SetupWorklogDto>> {
    return await this.usersService.findSetupWorklogById(id);
  }

  @Patch('update-user-information')
  @ApiOkResponse({ type: ResponseDto })
  async update(@Body() updateUserDto: UpdateUserDto): Promise<ResponseDto> {
    return await this.usersService.update(updateUserDto);
  }

  @Patch('change-password')
  @ApiOkResponse({ type: ResponseDto })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto): Promise<ResponseDto> {
    return await this.usersService.changePassword(changePasswordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
