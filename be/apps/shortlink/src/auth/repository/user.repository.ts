import { BadRequestException, Injectable } from '@nestjs/common';
import { UserModel } from '@libs/database/sequelize/models';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction } from 'sequelize';
import { EShortLinkConnection } from '@libs/common/enum';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserModel, EShortLinkConnection.WRITER)
    private readonly userWriterModel: typeof UserModel,
    @InjectModel(UserModel, EShortLinkConnection.READER)
    private readonly userReaderModel: typeof UserModel,
  ) {}

  async createUser(
    payload: Partial<UserModel>,
    transaction?: Transaction,
  ): Promise<UserModel> {
    const user = await this.userWriterModel.create(payload, { transaction });

    return user;
  }

  async getUserByUsername(username: string) {
    const result = await this.userReaderModel.findOne({
      where: { username },
    });

    if (!result) throw new BadRequestException(`username is not exist`);

    return result;
  }

  async getUserByEmail(email: string) {
    const result = await this.userReaderModel.findOne({
      where: { email },
    });

    if (!result) throw new BadRequestException(`email is not exist`);

    return result;
  }

  async existedBy(where: Partial<UserModel>, id?: string): Promise<boolean> {
    if (id) Object.assign(where, { id: { [Op.ne]: id } });

    const count = await this.userReaderModel.count({ where });

    return count > 0;
  }
}
