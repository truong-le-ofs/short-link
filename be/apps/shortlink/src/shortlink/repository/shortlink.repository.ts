import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction } from 'sequelize';
import { EShortLinkConnection } from '@libs/common/enum';
import {
  ShortlinkModel,
  ShortLinkScheduleModel,
  ShortLinkPasswordModel,
} from '@libs/database/sequelize/models';

@Injectable()
export class ShortlinkRepository {
  constructor(
    @InjectModel(ShortlinkModel, EShortLinkConnection.WRITER)
    private readonly shortlinkWriterModel: typeof ShortlinkModel,
    @InjectModel(ShortlinkModel, EShortLinkConnection.READER)
    private readonly shortlinkReaderModel: typeof ShortlinkModel,
  ) {}

  async createShortlink(
    payload: Partial<ShortlinkModel>,
    transaction?: Transaction,
  ): Promise<ShortlinkModel> {
    return await this.shortlinkWriterModel.create(payload, { transaction });
  }

  async updateShortlink(
    id: string,
    payload: Partial<ShortlinkModel>,
    transaction?: Transaction,
  ): Promise<boolean> {
    await this.shortlinkWriterModel.update(payload, {
      where: { id },
      transaction,
    });
    return true;
  }

  async deleteShortlink(id: string): Promise<boolean> {
    await this.shortlinkWriterModel.destroy({ where: { id } });
    return true;
  }

  async getShortlinkById(id: string) {
    const result = await this.shortlinkReaderModel.findOne({
      where: { id },
      include: [
        {
          model: ShortLinkScheduleModel,
          as: 'schedules',
        },
        {
          model: ShortLinkPasswordModel,
          as: 'passwords',
          attributes: { exclude: ['password'] },
        },
      ],
    });

    if (!result) throw new BadRequestException(`shortlink not found`);

    return result;
  }

  async getShortlinkByCode(short_code: string): Promise<ShortlinkModel | null> {
    return await this.shortlinkReaderModel.findOne({
      where: {
        short_code,
        is_active: true,
        [Op.or]: [
          { expires_at: null },
          { expires_at: { [Op.gt]: new Date() } },
        ],
      },
      include: [
        {
          model: ShortLinkScheduleModel,
          as: 'schedules',
          where: {
            start_time: { [Op.lte]: new Date() },
            end_time: { [Op.gte]: new Date() },
          },
          required: false,
        },
        {
          model: ShortLinkPasswordModel,
          as: 'passwords',
          where: {
            [Op.or]: [
              {
                [Op.and]: [{ start_time: null }, { end_time: null }],
              },
              {
                [Op.and]: [
                  { start_time: { [Op.lte]: new Date() } },
                  { end_time: { [Op.gte]: new Date() } },
                ],
              },
            ],
          },
          required: false,
        },
      ],
    });
  }

  async getUserShortlinks(
    userId: string,
    where: any = {},
    offset = 0,
    limit = 10,
  ): Promise<{ rows: ShortlinkModel[]; count: number }> {
    const searchCondition = {
      user_id: userId,
      ...where,
    };

    return await this.shortlinkReaderModel.findAndCountAll({
      where: searchCondition,
      limit,
      offset,
      order: [['created_at', 'desc']],
    });
  }

  async existsByShortCode(
    short_code: string,
    excludeId?: string,
  ): Promise<boolean> {
    const where: any = { short_code };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    const count = await this.shortlinkReaderModel.count({ where });
    return count > 0;
  }

  async generateUniqueShortCode(): Promise<string> {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortCode: string;
    let exists: boolean;

    do {
      shortCode = '';
      for (let i = 0; i < 6; i++) {
        shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      exists = await this.existsByShortCode(shortCode);
    } while (exists);

    return shortCode;
  }
}
