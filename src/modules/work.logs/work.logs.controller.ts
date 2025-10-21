import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe } from '@nestjs/common';
import { WorkLogsService } from './work.logs.service';
import { CreateWorkLogDto } from './dto/create-work.log.dto';
import { UpdateWorkLogDto } from './dto/update-work.log.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { ResponseDto } from '@/helpers/util';
import { WorkLogQueryDto } from './dto/worklog.dto';

@Controller('work-logs')
export class WorkLogsController {
  constructor(private readonly workLogsService: WorkLogsService) {}

  @Post()
  @ApiOkResponse({ type: ResponseDto })
  create(@Body() createWorkLogDto: CreateWorkLogDto) {
    return this.workLogsService.create(createWorkLogDto);
  }

  @Get('get-all')
  @ApiOkResponse({ type: ResponseDto })
  findAll(@Query(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })) query: WorkLogQueryDto,
  ) {
    return this.workLogsService.findAll(query, +query.current, +query.pageSize);
  }

  @Get('get-one/:id')
  @ApiOkResponse({ type: ResponseDto })
  findOne(@Param('id') id: string) {
    return this.workLogsService.findOneById(id);
  }

  @Patch('update-work-log')
  @ApiOkResponse({ type: ResponseDto })
  async update(@Body() updateWorkLogDto: UpdateWorkLogDto) {
    return await this.workLogsService.update(updateWorkLogDto);
  }

  @Delete('delete-work-log/:id')
  remove(@Param('id') id: string): Promise<ResponseDto> {
    return this.workLogsService.remove(id);
  }
}
