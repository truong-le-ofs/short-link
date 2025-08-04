import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { EShortLinkConnection } from '@libs/common/enum';
import { ShortLinkScheduleModel } from '@libs/database/sequelize/models';

@Injectable()
export class ShortlinkScheduleRepository {
  constructor(
    @InjectModel(ShortLinkScheduleModel, EShortLinkConnection.WRITER)
    private readonly scheduleWriterModel: typeof ShortLinkScheduleModel,
    @InjectModel(ShortLinkScheduleModel, EShortLinkConnection.READER)
    private readonly scheduleReaderModel: typeof ShortLinkScheduleModel,
  ) {}

  async createSchedule(
    payload: Partial<ShortLinkScheduleModel>,
    transaction?: Transaction,
  ): Promise<ShortLinkScheduleModel> {
    return await this.scheduleWriterModel.create(payload, { transaction });
  }

  async updateSchedule(
    id: string,
    payload: Partial<ShortLinkScheduleModel>,
    transaction?: Transaction,
  ): Promise<boolean> {
    await this.scheduleWriterModel.update(payload, {
      where: { id },
      transaction,
    });
    return true;
  }

  async deleteSchedule(id: string): Promise<boolean> {
    await this.scheduleWriterModel.destroy({ where: { id } });
    return true;
  }

  async getSchedulesByShortlinkId(
    shortlinkId: string,
  ): Promise<ShortLinkScheduleModel[]> {
    return await this.scheduleReaderModel.findAll({
      where: { shortlink_id: shortlinkId },
      order: [['start_time', 'asc']],
    });
  }

  async getScheduleById(id: string): Promise<ShortLinkScheduleModel | null> {
    return await this.scheduleReaderModel.findOne({
      where: { id },
    });
  }
}
