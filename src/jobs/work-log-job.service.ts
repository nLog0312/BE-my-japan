import { WorkLogsService } from '@/modules/work.logs/work.logs.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class WorkLogJobService {
    private readonly logger = new Logger(WorkLogJobService.name);

    constructor(private readonly WorkLogService: WorkLogsService) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCreateWorkLogDaily() {
        const today = new Date().getDay();
        if (today === 0 || today === 6) {
            return;
        }
        try {
            this.logger.log('Running daily WorkLog job...');
            await this.WorkLogService.addDailyRecordsForAllUsers();
            this.logger.log('✅ WorkLog record created successfully');
        } catch (error) {
            this.logger.log(`WorkLog record created error: ${error}`);
        }
    }
}
