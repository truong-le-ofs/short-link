import { EShortLinkConnection } from '@libs/common/enum';
import { ShortLinkAccessLogModel } from '@libs/database/sequelize/models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class ShortLinkAccessLogRepository {
  constructor(
    @InjectModel(ShortLinkAccessLogModel, EShortLinkConnection.WRITER)
    private readonly accessLogWriterModel: typeof ShortLinkAccessLogModel,
    @InjectModel(ShortLinkAccessLogModel, EShortLinkConnection.READER)
    private readonly accessLogReaderModel: typeof ShortLinkAccessLogModel,
  ) {}
}
