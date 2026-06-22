import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const swaggerTags = [
    { name: 'App' },
    { name: 'Auth' },
    { name: 'Users Admin' },
    { name: 'Patients' },
    { name: 'Patients Admin' },
    { name: 'Doctors' },
    { name: 'Doctors Admin' },
    { name: 'Doctor Schedules' },
    { name: 'Secretaries' },
    { name: 'Specialty' },
    { name: 'Admin' },
    { name: 'Storage' },
    { name: 'Appointments Admin' },
    { name: 'Appointments Doctor' },
    { name: 'Appointments Patients' },
  ];

  const configBuilder = new DocumentBuilder()
    .setTitle('Oxygen Clinic API')
    .setDescription('The Oxygen Clinic Management System API Description')
    .setVersion('1.0')
    .addBearerAuth();

  swaggerTags.forEach((tag) => {
    configBuilder.addTag(tag.name);
  });

  const document = SwaggerModule.createDocument(app, configBuilder.build());
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      // tagsSorter: 'alpha',
    },
  });
}
