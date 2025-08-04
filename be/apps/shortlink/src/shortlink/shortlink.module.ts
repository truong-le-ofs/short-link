import { EShortLinkConnection } from '@libs/common/enum';
import {
  ShortLinkAccessLogModel,
  ShortlinkModel,
  ShortLinkPasswordModel,
  ShortLinkScheduleModel,
} from '@libs/database/sequelize/models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ShortlinkController } from './shortlink.controller';
import { ShortlinkService } from './shortlink.service';
import { ShortlinkRepository } from './repository/shortlink.repository';
import { ShortlinkPasswordRepository } from './repository/shortlink-password.repository';
import { ShortlinkScheduleRepository } from './repository/shortlink-schedule.repository';

@Module({
  imports: [
    SequelizeModule.forFeature(
      [
        ShortlinkModel,
        ShortLinkScheduleModel,
        ShortLinkPasswordModel,
        ShortLinkAccessLogModel,
      ],
      EShortLinkConnection.WRITER,
    ),
    SequelizeModule.forFeature(
      [
        ShortlinkModel,
        ShortLinkScheduleModel,
        ShortLinkPasswordModel,
        ShortLinkAccessLogModel,
      ],
      EShortLinkConnection.READER,
    ),
  ],
  controllers: [ShortlinkController],
  providers: [
    ShortlinkService,
    ShortlinkRepository,
    ShortlinkPasswordRepository,
    ShortlinkScheduleRepository,
    // ShortLinkAccessLogRepository,
  ],
})
export class ShortlinkModule {}
