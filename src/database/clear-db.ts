import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  console.log('🧹 Starting data clearance...');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const dataSource = app.get(DataSource);

    const entities = dataSource.entityMetadatas;

    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0;');

    for (const entity of entities) {
      const tableName = entity.tableName;
      await dataSource.query(`TRUNCATE TABLE \`${tableName}\`;`);
      console.log(`- Cleared data from table: ${tableName}`);
    }

    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('✅ All data cleared successfully! Auto-increments are reset.');
  } catch (error) {
    console.error('❌ Error during data clearance:', error);

    const dataSource = app.get(DataSource);
    if (dataSource.isInitialized) {
      await dataSource.query('SET FOREIGN_KEY_CHECKS = 1;');
    }
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
