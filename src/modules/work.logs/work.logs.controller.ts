import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe, HttpCode } from '@nestjs/common';
import { WorkLogsService } from './work.logs.service';
import { CreateWorkLogDto } from './dto/create-work.log.dto';
import { UpdateWorkLogDto } from './dto/update-work.log.dto';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { ResponseDto } from '@/helpers/util';
import { WorkLogQueryDto } from './dto/worklog.dto';

@Controller('work-logs')
export class WorkLogsController {
  constructor(private readonly workLogsService: WorkLogsService) {}

  @Post()
  @HttpCode(200)
  @ApiOkResponse({ type: ResponseDto })
  create(@Body() createWorkLogDto: CreateWorkLogDto) {
    return this.workLogsService.create(createWorkLogDto);
  }

  @Post('get-all')
  @HttpCode(200)
  @ApiOkResponse({ type: ResponseDto })
  @ApiBody({ type: WorkLogQueryDto })
  findAll(
    @Body(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })) body: WorkLogQueryDto,
  ) {
    return this.workLogsService.findAll(body, +body.current, +body.pageSize);
  }

  @Get('get-one/:id')
  @HttpCode(200)
  @ApiOkResponse({ type: ResponseDto })
  findOne(@Param('id') id: string) {
    return this.workLogsService.findOneById(id);
  }

  @Patch('update-work-log')
  @HttpCode(200)
  @ApiOkResponse({ type: ResponseDto })
  async update(@Body() updateWorkLogDto: UpdateWorkLogDto) {
    return await this.workLogsService.update(updateWorkLogDto);
  }

  @Delete('delete-work-log/:id')
  @HttpCode(200)
  @ApiOkResponse({ type: ResponseDto })
  remove(@Param('id') id: string): Promise<ResponseDto> {
    return this.workLogsService.remove(id);
  }
}
