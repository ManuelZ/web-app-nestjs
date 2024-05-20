import { Module } from '@nestjs/common';
import { NotesModule } from './notes/notes.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NotesModule,
    DatabaseModule,
  ],
})
export class AppModule {}
