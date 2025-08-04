import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { EShortLinkConnection } from '@libs/common/enum';
import { ShortLinkPasswordModel } from '@libs/database/sequelize/models';

@Injectable()
export class ShortlinkPasswordRepository {
  constructor(
    @InjectModel(ShortLinkPasswordModel, EShortLinkConnection.WRITER)
    private readonly passwordWriterModel: typeof ShortLinkPasswordModel,
    @InjectModel(ShortLinkPasswordModel, EShortLinkConnection.READER)
    private readonly passwordReaderModel: typeof ShortLinkPasswordModel,
  ) {}

  async createPassword(
    payload: Partial<ShortLinkPasswordModel>,
    transaction?: Transaction,
  ): Promise<ShortLinkPasswordModel> {
    return await this.passwordWriterModel.create(payload, { transaction });
  }

  async updatePassword(
    id: string,
    payload: Partial<ShortLinkPasswordModel>,
    transaction?: Transaction,
  ): Promise<boolean> {
    await this.passwordWriterModel.update(payload, {
      where: { id },
      transaction,
    });
    return true;
  }

  async deletePassword(id: string): Promise<boolean> {
    await this.passwordWriterModel.destroy({ where: { id } });
    return true;
  }

  async getPasswordsByShortlinkId(
    shortlinkId: string,
  ): Promise<ShortLinkPasswordModel[]> {
    return await this.passwordReaderModel.findAll({
      where: { shortlink_id: shortlinkId },
      order: [['created_at', 'desc']],
    });
  }

  async getPasswordById(id: string): Promise<ShortLinkPasswordModel | null> {
    return await this.passwordReaderModel.findOne({
      where: { id },
    });
  }
}
