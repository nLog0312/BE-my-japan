import { Module } from '@nestjs/common';
import { MonthlySheetsService } from './monthly.sheets.service';
import { MonthlySheetsController } from './monthly.sheets.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MonthlySheet, MonthlySheetSchema } from './schemas/monthly.sheet.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MonthlySheet.name, schema: MonthlySheetSchema }]),
    UsersModule
  ],
  controllers: [MonthlySheetsController],
  providers: [MonthlySheetsService],
})
export class MonthlySheetsModule {}
