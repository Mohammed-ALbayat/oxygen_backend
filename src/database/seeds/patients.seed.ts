import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from 'src/users/entities/user.entity';
import {
  BloodType,
  Gender,
  Patient,
} from 'src/patients/entities/patient.entity';

@Injectable()
export class PatientsSeed {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async seed() {
    const count = await this.patientRepository.count();

    if (count > 0) {
      console.log('Patients already seeded');
      return;
    }

    for (let i = 0; i < 10; i++) {
      // إنشاء user
      const user = this.userRepository.create({
        full_name: `Patient ${i}`,
        username: `patient${i}`,
        phone: `099999997${i}`,
        role: UserRole.PATIENT,
      });

      const savedUser = await this.userRepository.save(user);

      // إنشاء profile
      const patient = this.patientRepository.create({
        user: savedUser,

        birth_date: new Date(1990, i % 12, i),

        address: `Damascus Street ${i}`,

        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,

        blood_type: i % 2 === 0 ? BloodType.A_POSITIVE : BloodType.O_POSITIVE,

        allergies: `Allergy ${i}`,

        previous_operations: `Operation ${i}`,

        chronic_diseases: `Disease ${i}`,

        permanent_medications: `Medicine ${i}`,

        tall: 160 + i,

        weight: 60 + i,
      });

      await this.patientRepository.save(patient);
    }

    console.log('10 patients seeded successfully');
  }
}
