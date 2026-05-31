import { Module } from '@nestjs/common';
import { DoctorSchedulesService } from './doctor-schedules.service';
import { DoctorSchedulesController } from './doctor-schedules.controller';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { DoctorSchedule } from './entities/doctor-schedule.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([DoctorSchedule, Doctor])],
  providers: [DoctorSchedulesService],
  controllers: [DoctorSchedulesController],
})
export class DoctorSchedulesModule {}
