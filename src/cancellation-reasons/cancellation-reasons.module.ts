import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminCancellationReasonsController } from './admin-cancellation-reasons.controller';
import { CancellationReasonsService } from './cancellation-reasons.service';
import { CancellationReason } from './entities/cancellation-reason.entity';
import { PatientCancellationReasonsController } from './patient-cancellation-reasons.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CancellationReason])],
  controllers: [
    AdminCancellationReasonsController,
    PatientCancellationReasonsController,
  ],
  providers: [CancellationReasonsService],
  exports: [CancellationReasonsService],
})
export class CancellationReasonsModule {}
