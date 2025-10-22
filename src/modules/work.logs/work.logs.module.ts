import { Module } from '@nestjs/common';
import { WorkLogsService } from './work.logs.service';
import { WorkLogsController } from './work.logs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkLog, WorkLogSchema } from './schemas/work.log.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WorkLog.name, schema: WorkLogSchema }]),
    UsersModule
  ],
  controllers: [WorkLogsController],
  providers: [WorkLogsService],
  exports: [WorkLogsService],
})
export class WorkLogsModule {}
