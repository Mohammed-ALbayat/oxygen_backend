import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PatientsService } from '../patients/patients.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private patientsService: PatientsService,
    private jwtService: JwtService,
  ) {}

  async login(phone: string, pass: string) {
    const patient = await this.patientsService.findOneByPhone(phone);
    const isMatch = patient ? await bcrypt.compare(pass, patient.password) : false;
    if (!isMatch || !patient) {
        throw new UnauthorizedException('رقم الهاتف أو كلمة المرور غير صحيحة');
    }
    if (!patient.is_verified) {
        throw new UnauthorizedException('يرجى تفعيل الحساب أولاً');
    }
    const payload = { 
        sub: patient.id, 
        phone: patient.phone_number,
    };

    return {
      access_token: this.jwtService.sign(payload),
      patient_id: patient.id
    };
  }
}