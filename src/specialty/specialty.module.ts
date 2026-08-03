import { Module } from '@nestjs/common';
import { SpecialtyService } from './specialty.service';
import { SpecialtyController } from './specialty.controller';
import { PublishedSpecialtiesController } from './published-specialties.controller';
import { Specialty } from './entities/specialty.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Specialty])],
  controllers: [SpecialtyController, PublishedSpecialtiesController],
  providers: [SpecialtyService],
})
export class SpecialtyModule {}
