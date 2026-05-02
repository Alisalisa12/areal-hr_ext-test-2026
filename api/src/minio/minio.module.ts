import { Global, Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { MINIO_TOKEN } from './minio.decorator';
import * as Minio from 'minio';

@Global()
@Module({
  exports: [MINIO_TOKEN],
  providers: [
    {
      inject: [ConfigService],
      provide: MINIO_TOKEN,
      useFactory: async (
        configService: ConfigService,
      ): Promise<Minio.Client> => {
        const client = new Minio.Client({
          endPoint: configService.getOrThrow('MINIO_ENDPOINT'),
          port: +configService.getOrThrow('MINIO_PORT'),
          accessKey: configService.getOrThrow('MINIO_ACCESS_KEY'),
          secretKey: configService.getOrThrow('MINIO_SECRET_KEY'),
          useSSL: false,
        });

        const bucketName = 'hr-files';
        const exists = await client.bucketExists(bucketName);
        if (!exists) {
          await client.makeBucket(bucketName);
        }

        return client;
      },
    },
  ],
})
export class MinioModule {}
