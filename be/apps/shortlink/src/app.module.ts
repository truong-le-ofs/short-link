import { Module } from '@nestjs/common';
import { ShortlinkModule } from './shortlink/shortlink.module';
import { DatabaseModule } from '@libs/database/connection';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '@libs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    ShortlinkModule,
  ],
})
export class AppModule {}
