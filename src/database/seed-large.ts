import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { LargeSeedModule } from './seeds/large/large-seed.module';
import { LargeSeederService } from './seeds/large/large-seeder.service';

async function bootstrap() {
  console.log('🌱 Starting large data seeding...');

  const app = await NestFactory.createApplicationContext(LargeSeedModule);

  try {
    await app.get(LargeSeederService).run();
    console.log('✨ Large data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Large data seeding failed!', error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
