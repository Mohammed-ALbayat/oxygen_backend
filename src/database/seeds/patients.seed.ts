import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/users/enums/user-roles.enum';
import { Gender } from 'src/users/enums/gender.enum';
import { BloodType, Patient } from 'src/patients/entities/patient.entity';

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
      const user = this.userRepository.create({
        full_name: `Patient ${i}`,
        phone: `099999997${i}`,
        role: UserRole.PATIENT,
        birth_date: new Date(1990, i % 12, i),
        gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
      });

      const savedUser = await this.userRepository.save(user);

      const patient = this.patientRepository.create({
        userId: savedUser.id,
        user: savedUser,
        address: `Damascus Street ${i}`,
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
