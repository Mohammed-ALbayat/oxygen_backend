import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AdminSeed } from './database/seeds/admin.seed';
import { DoctorsSeed } from './database/seeds/doctors.seed';
import { SpecialtiesSeed } from './database/seeds/specialties.seed';
import { PatientsSeed } from './database/seeds/patients.seed';
import { SecretariesSeed } from './database/seeds/secretaries.seed';
import { DemoDoctorSeed } from './database/seeds/demo-doctor.seed';
import { AppointmentsSeed } from './database/seeds/appointments.seed';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Oxygen')
    .setDescription('Oxygen API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const adminSeed = app.get(AdminSeed);
  const specialtiesSeed = app.get(SpecialtiesSeed);
  const doctorsSeed = app.get(DoctorsSeed);
  const patientsSeed = app.get(PatientsSeed);
  const secretariesSeed = app.get(SecretariesSeed);
  const demoDoctorSeed = app.get(DemoDoctorSeed);
  const appointmentsSeed = app.get(AppointmentsSeed);

  await adminSeed.seed();
  await specialtiesSeed.seed();
  await doctorsSeed.seed();
  await patientsSeed.seed();
  await secretariesSeed.seed();
  await demoDoctorSeed.seed();
  await appointmentsSeed.seed();

  app.enableCors();

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
