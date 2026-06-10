import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DoctorsModule } from './doctors/doctors.module';
import { DatabaseModule } from './database/database.module';
import { SpecialtyModule } from './specialty/specialty.module';
import { PatientsModule } from './patients/patients.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SecretariesModule } from './secretaries/secretaries.module';
import { DoctorSchedulesModule } from './doctor-schedules/doctor-schedules.module';
import { SeedModule } from './database/seeds/seed.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SeedModule,
    DoctorsModule,
    DatabaseModule,
    SpecialtyModule,
    PatientsModule,
    AuthModule,
    UsersModule,
    SecretariesModule,
    DoctorSchedulesModule,
    AppointmentsModule,
    NotificationsModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
