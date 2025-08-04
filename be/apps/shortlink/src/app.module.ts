import { Module } from '@nestjs/common';
import { configuration } from '@libs/config';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@libs/database/connection';
import { AuthModule } from './auth/auth.module';
import { ShortlinkModule } from './shortlink/shortlink.module';

const modules = [AuthModule, ShortlinkModule];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    ...modules,
  ],
})
export class AppModule {}
