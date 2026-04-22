import { Injectable } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto) {
    const patient = this.patientRepository.create(createPatientDto);

    return await this.patientRepository.save(patient);
  }

  async findAll() {
    return this.patientRepository.find();
  }

  async findOne(id: number) {
    return this.patientRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async findByUPhoneNumber(phone_number: string) {
    return this.patientRepository.findOne({
      where: {
        phone_number: phone_number,
      },
    });
  }

  async update(id: number, updatePatientDto: UpdatePatientDto) {
    return this.patientRepository.update({ id: id }, updatePatientDto);
  }

  async remove(id: number) {
    return this.patientRepository.delete({ id: id });
  }
}
