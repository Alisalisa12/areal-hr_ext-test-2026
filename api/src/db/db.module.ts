import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../constants';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';

const dbProvider = {
  provide: PG_CONNECTION,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) =>
    new Pool({
      user: configService.get('DB_USER'),
      host: configService.get('DB_HOST'),
      database: configService.get('DB_NAME'),
      password: configService.get('DB_PASSWORD'),
      port: Number(configService.get('DB_PORT')),
    }),
};

@Module({
  imports: [ConfigModule],
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DbModule {}
