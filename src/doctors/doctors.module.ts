import { Module } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { Specialty } from 'src/specialty/entities/specialty.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, Specialty, User])],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService], // تأكد من تصدير الخدمة إذا كانت مستخدمة في أماكن أخرى
})
export class DoctorsModule {}
