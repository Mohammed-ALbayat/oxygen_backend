import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private patientsService: PatientsService,
    private doctorsService: DoctorsService,
    private jwtService: JwtService,
  ) {}

  private generateToken(user: any, role: 'patient' | 'doctor') {
    const payload = { 
      sub: user.id, 
      username: user.username || user.phone_number,
      role: role
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        role: role
      }
    };
  }

  async loginPatient(phone: string, pass: string) {
    const patient = await this.patientsService.findOneByPhone(phone);
    
    const isMatch = await bcrypt.compare(pass, patient?.password || '');

    if (!patient || !isMatch) {
      throw new UnauthorizedException('رقم الهاتف أو كلمة المرور غير صحيحة');
    }

    if (!patient.is_verified) {
      throw new UnauthorizedException('يرجى تفعيل الحساب أولاً');
    }

    return this.generateToken(patient, 'patient');
  }

  async loginDoctor(username: string, pass: string) {
    const doctor = await this.doctorsService.findByUsername(username);
    const isMatch = await bcrypt.compare(pass, doctor?.password || '');

    if (!doctor || !isMatch) {
      throw new UnauthorizedException('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    return this.generateToken(doctor, 'doctor');
  }
}