import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AdminSeed } from './database/seeds/admin.seed';
import { DoctorsSeed } from './database/seeds/doctors.seed';
import { SpecialtiesSeed } from './database/seeds/specialties.seed';
import { PatientsSeed } from './database/seeds/patients.seed';
import { SecretariesSeed } from './database/seeds/secretaries.seed';

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
  const adminSeed = app.get(AdminSeed);
  const specialtiesSeed = app.get(SpecialtiesSeed);
  const doctorsSeed = app.get(DoctorsSeed);
  const patientsSeed = app.get(PatientsSeed);
  const secretariesSeed = app.get(SecretariesSeed);

  await adminSeed.seed();
  await specialtiesSeed.seed();
  await doctorsSeed.seed();
  await patientsSeed.seed();
  await secretariesSeed.seed();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
