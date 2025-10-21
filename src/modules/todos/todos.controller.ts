import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe } from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { ResponseDto } from '@/helpers/util';
import { TodoQueryDto } from './dto/todo.dto';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @ApiOkResponse({ type: ResponseDto })
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(createTodoDto);
  }

  @Get('get-all')
  @ApiOkResponse({ type: ResponseDto })
  findAll(@Query(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })) query: TodoQueryDto,
  ) {
    return this.todosService.findAll(query, +query.current, +query.pageSize);
  }

  @Get('get-one/:id')
  @ApiOkResponse({ type: ResponseDto })
  findOne(@Param('id') id: string) {
    return this.todosService.findOneById(id);
  }

  @Patch('update-todo')
  @ApiOkResponse({ type: ResponseDto })
  update(@Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(updateTodoDto);
  }

  @Delete('delete-todo/:id')
  @ApiOkResponse({ type: ResponseDto })
  remove(@Param('id') id: string): Promise<ResponseDto> {
    return this.todosService.remove(id);
  }
}
