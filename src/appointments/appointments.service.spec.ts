import { Test, TestingModule } from '@nestjs/testing';
import { AdminAppointmentsService } from './admin-appointments.service';

describe('AdminAppointmentsService', () => {
  let service: AdminAppointmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminAppointmentsService,],
    }).compile();

    service = module.get<AdminAppointmentsService>(AdminAppointmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
