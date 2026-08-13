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
import { AppointmentsModule } from './appointments/appointments.module';
import { AdminModule } from './admin/admin.module';
import { StorageModule } from './storage/storage.module';
import { VisitsModule } from './visits/visits.module';
import { PusherService } from './pusher/pusher.service';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DoctorsModule,
    DatabaseModule,
    SpecialtyModule,
    PatientsModule,
    AuthModule,
    UsersModule,
    SecretariesModule,
    DoctorSchedulesModule,
    AppointmentsModule,
    AdminModule,
    StorageModule,
    VisitsModule,
    StripeModule,
  ],
  controllers: [AppController],
  providers: [AppService, PusherService],
})
export class AppModule {}
