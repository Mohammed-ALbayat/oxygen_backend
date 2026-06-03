import { Test, TestingModule } from '@nestjs/testing';
import { AdminAppointmentsController } from './admin-appointments.controller';
import { AdminAppointmentsService } from './admin-appointments.service';

describe('AdminAppointmentsController', () => { 
  let controller: AdminAppointmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAppointmentsController],
      providers: [AdminAppointmentsService,],
    }).compile();

    controller = module.get<AdminAppointmentsController>(
      AdminAppointmentsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
