import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OtpVerification } from './entities/otp-verification.entity';
import { OtpService } from './otp.service';
import { Patient } from 'src/patients/entities/patient.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '1d' },
      }),
    }),

    TypeOrmModule.forFeature([User, OtpVerification, Patient]),
  ],

  providers: [AuthService, JwtStrategy, OtpService],
  controllers: [AuthController],
  exports: [AuthService, OtpService, JwtModule],
})
export class AuthModule {}
