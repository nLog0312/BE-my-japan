import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WorkLogJobService } from './work-log-job.service';
import { WorkLogsModule } from '@/modules/work.logs/work.logs.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        WorkLogsModule
    ],
    providers: [WorkLogJobService],
})
export class JobsModule {}