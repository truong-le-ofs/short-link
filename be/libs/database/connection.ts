import { EShortLinkConnection } from '@libs/common/enum';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

const ShortLinkWriterConnection = SequelizeModule.forRootAsync({
  inject: [ConfigService],
  name: EShortLinkConnection.WRITER,
  useFactory: (configService: ConfigService) => ({
    dialect: 'postgres',
    host: configService.get('postgres.shortLinkService.writer.host'),
    port: configService.get('postgres.shortLinkService.writer.port'),
    username: configService.get('postgres.shortLinkService.writer.username'),
    password: configService.get('postgres.shortLinkService.writer.password'),
    database: configService.get('postgres.shortLinkService.writer.database'),
    timezone: configService.get('postgres.shortLinkService.writer.timezone'),
    // models: Object.values(NobiModels),
    autoLoadModels: true,
    pool: { min: 2, max: 50, idle: 60000, evict: 15000 },
    dialectOptions: {
      keepAlive: true,
    },
    logging: false,
  }),
});

const ShortLinkReaderConnection = SequelizeModule.forRootAsync({
  inject: [ConfigService],
  name: EShortLinkConnection.WRITER,
  useFactory: (configService: ConfigService) => ({
    dialect: 'postgres',
    host: configService.get('postgres.shortLinkService.reader.host'),
    port: configService.get('postgres.shortLinkService.reader.port'),
    username: configService.get('postgres.shortLinkService.reader.username'),
    password: configService.get('postgres.shortLinkService.reader.password'),
    database: configService.get('postgres.shortLinkService.reader.database'),
    timezone: configService.get('postgres.shortLinkService.reader.timezone'),
    // models: Object.values(NobiModels),
    autoLoadModels: true,
    pool: { min: 2, max: 50, idle: 60000, evict: 15000 },
    dialectOptions: {
      keepAlive: true,
    },
    logging: false,
  }),
});

@Module({
  imports: [ShortLinkWriterConnection, ShortLinkReaderConnection],
})
export class DatabaseModule {}
