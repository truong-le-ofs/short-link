import { Injectable } from '@nestjs/common';
import { UserSessionModel } from '@libs/database/sequelize/models';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { EShortLinkConnection } from '@libs/common/enum';

@Injectable()
export class UserSessionRepository {
  constructor(
    @InjectModel(UserSessionModel, EShortLinkConnection.WRITER)
    private readonly userSessionWriterModel: typeof UserSessionModel,
    @InjectModel(UserSessionModel, EShortLinkConnection.READER)
    private readonly userSessionReaderModel: typeof UserSessionModel,
  ) {}

  async createUserSession(
    payload: Partial<UserSessionModel>,
    transaction?: Transaction,
  ): Promise<UserSessionModel> {
    const session = await this.userSessionWriterModel.create(payload, {
      transaction,
    });

    return session;
  }

}
