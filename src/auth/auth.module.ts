import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PatientsModule } from '../patients/patients.module'; // تأكد من المسار
import { DoctorsModule } from '../doctors/doctors.module'; // تأكد من المسار
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    DoctorsModule,
    PatientsModule,   // ليش؟ عشان الـ AuthService يحتاج يبحث عن المريض في قاعدة البيانات
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' }, // التوكن صالح ليوم واحد
    }),
  ],
  providers: [AuthService, JwtStrategy], 
  controllers: [AuthController],
  exports: [AuthService], // عشان لو احتجنا الـ Auth في مكان تاني
})
export class AuthModule {}