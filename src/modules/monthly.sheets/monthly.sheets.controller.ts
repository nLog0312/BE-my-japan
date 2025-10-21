import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, Query } from '@nestjs/common';
import { MonthlySheetsService } from './monthly.sheets.service';
import { CreateMonthlySheetDto } from './dto/create-monthly.sheet.dto';
import { UpdateMonthlySheetDto } from './dto/update-monthly.sheet.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { ResponseDto } from '@/helpers/util';
import { MonthSheetQueryDto } from './dto/monthsheet.dto';

@Controller('monthly-sheets')
export class MonthlySheetsController {
  constructor(private readonly monthlySheetsService: MonthlySheetsService) {}

  @Post()
  @ApiOkResponse({ type: ResponseDto })
  async create(@Body() createMonthlySheetDto: CreateMonthlySheetDto): Promise<ResponseDto> {
    return await this.monthlySheetsService.create(createMonthlySheetDto);
  }

  @Get('get-all')
  @ApiOkResponse({ type: ResponseDto })
  findAll(@Query(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })) query: MonthSheetQueryDto,
  ) {
    return this.monthlySheetsService.findAll(query, +query.current, +query.pageSize);
  }

  @Get('get-one/:id')
  @ApiOkResponse({ type: ResponseDto })
  findOne(@Param('id') id: string) {
    return this.monthlySheetsService.findOneById(id);
  }

  @Patch('update-monthly-sheet')
  @ApiOkResponse({ type: ResponseDto })
  update(@Body() updateMonthlySheetDto: UpdateMonthlySheetDto) {
    return this.monthlySheetsService.update(updateMonthlySheetDto);
  }

  @Delete('delete-monthly-sheet/:id')
  @ApiOkResponse({ type: ResponseDto })
  remove(@Param('id') id: string): Promise<ResponseDto> {
    return this.monthlySheetsService.remove(id);
  }
}
