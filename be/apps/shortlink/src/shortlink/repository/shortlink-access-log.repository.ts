import { EShortLinkConnection } from '@libs/common/enum';
import { ShortLinkAccessLogModel } from '@libs/database/sequelize/models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction, Op } from 'sequelize';

@Injectable()
export class ShortLinkAccessLogRepository {
  constructor(
    @InjectModel(ShortLinkAccessLogModel, EShortLinkConnection.WRITER)
    private readonly accessLogWriterModel: typeof ShortLinkAccessLogModel,
    @InjectModel(ShortLinkAccessLogModel, EShortLinkConnection.READER)
    private readonly accessLogReaderModel: typeof ShortLinkAccessLogModel,
  ) {}

  async createAccessLog(
    payload: Partial<ShortLinkAccessLogModel>,
    transaction?: Transaction,
  ): Promise<ShortLinkAccessLogModel> {
    return await this.accessLogWriterModel.create(payload, { transaction });
  }

  async getAccessLogsByShortlinkId(
    shortlinkId: string,
    limit?: number,
    offset?: number,
  ): Promise<{ rows: ShortLinkAccessLogModel[]; count: number }> {
    return await this.accessLogReaderModel.findAndCountAll({
      where: { shortlink_id: shortlinkId },
      order: [['accessed_at', 'desc']],
      limit,
      offset,
    });
  }

  async getAccessStatsForShortlink(shortlinkId: string): Promise<{
    totalAccess: number;
    uniqueIPs: number;
    topCountries: Array<{ country: string; count: number }>;
    accessByDate: Array<{ date: string; count: number }>;
  }> {
    const totalAccess = await this.accessLogReaderModel.count({
      where: { shortlink_id: shortlinkId },
    });

    const uniqueIPs = await this.accessLogReaderModel.count({
      where: { shortlink_id: shortlinkId },
      distinct: true,
      col: 'ip_address',
    });

    // Top countries
    const topCountries = (await this.accessLogReaderModel.findAll({
      attributes: [
        'country',
        [
          this.accessLogReaderModel.sequelize!.fn(
            'COUNT',
            this.accessLogReaderModel.sequelize!.col('country'),
          ),
          'count',
        ],
      ],
      where: {
        shortlink_id: shortlinkId,
        country: { [Op.ne]: null },
      },
      group: ['country'],
      order: [[this.accessLogReaderModel.sequelize!.literal('count'), 'DESC']],
      limit: 10,
      raw: true,
    })) as unknown as Array<{ country: string; count: number }>;

    // Access by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const accessByDate = (await this.accessLogReaderModel.findAll({
      attributes: [
        [
          this.accessLogReaderModel.sequelize!.fn(
            'DATE',
            this.accessLogReaderModel.sequelize!.col('accessed_at'),
          ),
          'date',
        ],
        [
          this.accessLogReaderModel.sequelize!.fn(
            'COUNT',
            this.accessLogReaderModel.sequelize!.col('id'),
          ),
          'count',
        ],
      ],
      where: {
        shortlink_id: shortlinkId,
        accessed_at: { [Op.gte]: thirtyDaysAgo },
      },
      group: [
        this.accessLogReaderModel.sequelize!.fn(
          'DATE',
          this.accessLogReaderModel.sequelize!.col('accessed_at'),
        ),
      ],
      order: [[this.accessLogReaderModel.sequelize!.literal('date'), 'ASC']],
      raw: true,
    })) as unknown as Array<{ date: string; count: number }>;

    return {
      totalAccess,
      uniqueIPs,
      topCountries,
      accessByDate,
    };
  }

  async getUserAccessStats(userId: string): Promise<{
    totalAccess: number;
    uniqueIPs: number;
    topReferrers: Array<{ referrer: string; count: number }>;
  }> {
    const totalAccess = await this.accessLogReaderModel.count({
      include: [
        {
          model: this.accessLogReaderModel.sequelize!.models.ShortlinkModel,
          as: 'shortlink',
          where: { user_id: userId },
          attributes: [],
        },
      ],
    });

    const uniqueIPs = await this.accessLogReaderModel.count({
      include: [
        {
          model: this.accessLogReaderModel.sequelize!.models.ShortlinkModel,
          as: 'shortlink',
          where: { user_id: userId },
          attributes: [],
        },
      ],
      distinct: true,
      col: 'ip_address',
    });

    const topReferrers = (await this.accessLogReaderModel.findAll({
      attributes: [
        'referrer',
        [
          this.accessLogReaderModel.sequelize!.fn(
            'COUNT',
            this.accessLogReaderModel.sequelize!.col('referrer'),
          ),
          'count',
        ],
      ],
      include: [
        {
          model: this.accessLogReaderModel.sequelize!.models.ShortlinkModel,
          as: 'shortlink',
          where: { user_id: userId },
          attributes: [],
        },
      ],
      where: {
        referrer: { [Op.ne]: null },
      },
      group: ['referrer'],
      order: [[this.accessLogReaderModel.sequelize!.literal('count'), 'DESC']],
      limit: 10,
      raw: true,
    })) as unknown as Array<{ referrer: string; count: number }>;

    return {
      totalAccess,
      uniqueIPs,
      topReferrers,
    };
  }
}
