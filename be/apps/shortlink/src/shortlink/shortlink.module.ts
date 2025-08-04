import { EShortLinkConnection } from '@libs/common/enum';
import {
  ShortLinkAccessLogModel,
  ShortlinkModel,
  ShortLinkPasswordModel,
  ShortLinkScheduleModel,
} from '@libs/database/sequelize/models';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ShortlinkController } from './controllers/shortlink.controller';
import { ShortlinkService } from './services/shortlink.service';
import { ShortlinkRepository } from './repository/shortlink.repository';
import { ShortlinkPasswordRepository } from './repository/shortlink-password.repository';
import { ShortlinkScheduleRepository } from './repository/shortlink-schedule.repository';
import { ShortlinkPasswordService } from './services/shortlink-password.service';
import { ShortlinkScheduleService } from './services/shortlink-schedule.service';
import { ShortlinkAccessService } from './services/shortlink-access.service';
import { ShortlinkPasswordController } from './controllers/shortlink-password.controller';
import { ShortlinkScheduleController } from './controllers/shortlink-schedule.controller';
import { ShortlinkAccessController } from './controllers/shortlink-access.controller';

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
  controllers: [
    ShortlinkController,
    ShortlinkAccessController,
    ShortlinkPasswordController,
    ShortlinkScheduleController,
  ],
  providers: [
    ShortlinkService,
    ShortlinkRepository,
    ShortlinkAccessService,
    ShortlinkPasswordService,
    ShortlinkScheduleService,
    ShortlinkScheduleRepository,
    ShortlinkPasswordRepository,
    // ShortLinkAccessLogRepository,
  ],
})
export class ShortlinkModule {}
