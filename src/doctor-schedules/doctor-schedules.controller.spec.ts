import { Test, TestingModule } from '@nestjs/testing';
import { DoctorSchedulesController } from './doctor-schedules.controller';

describe('DoctorSchedulesController', () => {
  let controller: DoctorSchedulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctorSchedulesController],
    }).compile();

    controller = module.get<DoctorSchedulesController>(
      DoctorSchedulesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
