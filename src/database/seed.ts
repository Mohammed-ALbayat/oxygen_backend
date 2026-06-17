import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seeds/seed.module';
import { MainSeederService } from './seeds/main-seeder.service';

async function bootstrap() {
  console.log('🌱 Starting database seeding...');

  // Create a standalone application context using the SeedModule
  const app = await NestFactory.createApplicationContext(SeedModule);

  // Retrieve the orchestrator service
  const mainSeederService = app.get(MainSeederService);

  try {
    await mainSeederService.runAllSeeds();
    console.log('✨ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed!', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
