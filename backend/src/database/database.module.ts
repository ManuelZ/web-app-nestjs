import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from '../notes/entities/note.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.getOrThrow('DB_HOST'),
        port: parseInt(configService.getOrThrow('DB_PORT'), 10),
        username: configService.getOrThrow('DB_USERNAME'),
        password: configService.getOrThrow('DB_ROOT_PASSWORD'),
        database: configService.getOrThrow('DB_NAME'),
        entities: [Note],
        autoLoadEntities: true,
        synchronize: configService.getOrThrow('DB_SYNCHRONIZE'), // gotta be false in production
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
