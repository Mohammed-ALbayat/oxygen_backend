import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  console.log('⚠️ Starting database reset...');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const dataSource = app.get(DataSource);

    console.log('🗑️ Dropping the database schema...');
    await dataSource.dropDatabase();

    console.log('✅ Database Dropped successfully!');
  } catch (error) {
    console.error('❌ Error during database dropping:', error);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
