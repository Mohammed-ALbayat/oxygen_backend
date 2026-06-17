import { Injectable, Logger } from '@nestjs/common';
import { AdminSeed } from './admin.seed';
import { AppointmentsSeed } from './appointments.seed';
import { DemoDoctorSeed } from './demo-doctor.seed';
import { DoctorsSeed } from './doctors.seed';
import { PatientsSeed } from './patients.seed';
import { SecretariesSeed } from './secretaries.seed';
import { SpecialtiesSeed } from './specialties.seed';

@Injectable()
export class MainSeederService {
  private readonly logger = new Logger(MainSeederService.name);

  constructor(
    private readonly adminSeed: AdminSeed,
    private readonly appointmentsSeed: AppointmentsSeed,
    private readonly demoDoctorSeed: DemoDoctorSeed,
    private readonly doctorsSeed: DoctorsSeed,
    private readonly patientsSeed: PatientsSeed,
    private readonly secretariesSeed: SecretariesSeed,
    private readonly specialtiesSeed: SpecialtiesSeed,
  ) {}

  async runAllSeeds(): Promise<void> {
    this.logger.log('Starting execution of all seeds...');

    await this.specialtiesSeed.seed();
    await this.adminSeed.seed();
    await this.patientsSeed.seed();
    await this.secretariesSeed.seed();
    await this.doctorsSeed.seed();
    await this.demoDoctorSeed.seed();
    await this.appointmentsSeed.seed();

    this.logger.log('All seeds have been executed successfully.');
  }
}
