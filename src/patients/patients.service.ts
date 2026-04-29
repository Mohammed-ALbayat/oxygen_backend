import { 
  Injectable, 
  ConflictException, 
  NotFoundException, 
  BadRequestException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  
  async create(createPatientDto: CreatePatientDto) {
    const phone = createPatientDto.phone_number;
    const password = createPatientDto.password;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = "123456"; 
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5);

    try {
      const patientData = {
        ...createPatientDto,      
        password: hashedPassword,
        // otpCode: otp,             
        // otpExpires: expiry,       
      };

      const patient = this.patientRepository.create(patientData);
      const savedPatient: any = await this.patientRepository.save(patient);    
      return {
        success: true,
        message: 'تمت عملية التسجيل المبدئي بنجاح',
        data: {
          patientId: savedPatient.id, 
          phone: savedPatient.phone_number, 
          otpCode: otp,
          expiresAt: expiry
        }
      };
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        throw new ConflictException('رقم الهاتف هذا مسجل مسبقاً');
      }
      throw error;
    }
}


  async findOneByPhone(phone_number: string) {
    return await this.patientRepository.findOne({
      where: { phone_number },
    });
  }

  
  async verifyOtp(phone: string, otp: string) {
    const patient = await this.findOneByPhone(phone);
    try {
        if (!patient) {
          throw new NotFoundException('المريض غير موجود');
        }

        if ("123456" !== otp) {
          throw new BadRequestException('رمز التحقق غير صحيح');
        }

        patient.is_verified = true;
        // patient.otpCode = null;
        
        await this.patientRepository.save(patient);

        return { message: 'تم تفعيل الحساب بنجاح' };
    } catch (error) {
        throw error;
    }
  }







  async findAll() {
    return await this.patientRepository.find();
  }

  async findOne(id: number) {
    return await this.patientRepository.findOne({ where: { id } });
  }

  async update(id: number, updatePatientDto: UpdatePatientDto) {
    return await this.patientRepository.update(id, updatePatientDto);
  }

  async remove(id: number) {
    return await this.patientRepository.delete(id);
  }
}