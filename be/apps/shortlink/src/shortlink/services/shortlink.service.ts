import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Transaction } from 'sequelize';
import { ShortlinkRepository } from '../repository/shortlink.repository';
import { ShortlinkScheduleRepository } from '../repository/shortlink-schedule.repository';
import { ShortlinkPasswordRepository } from '../repository/shortlink-password.repository';
import {
  CreateShortlinkDto,
  UpdateShortlinkDto,
  ShortlinkQueryDto,
} from '../dto/shortlink.dto';
import { ShortlinkModel } from '@libs/database/sequelize/models';
import { Op } from 'sequelize';

@Injectable()
export class ShortlinkService {
  constructor(
    private readonly shortlinkRepository: ShortlinkRepository,
    private readonly scheduleRepository: ShortlinkScheduleRepository,
    private readonly passwordRepository: ShortlinkPasswordRepository,
  ) {}

  async createShortlink(
    userId: string,
    payload: CreateShortlinkDto,
    transaction?: Transaction,
  ): Promise<ShortlinkModel> {
    let shortCode = payload.short_code;

    if (!shortCode) {
      shortCode = await this.shortlinkRepository.generateUniqueShortCode();
    } else {
      const exists =
        await this.shortlinkRepository.existsByShortCode(shortCode);
      if (exists) {
        throw new BadRequestException('Short code already exists');
      }
    }

    const shortlinkData = {
      ...payload,
      short_code: shortCode,
      user_id: userId,
      expires_at: payload.expires_at ? new Date(payload.expires_at) : undefined,
    };

    return await this.shortlinkRepository.createShortlink(
      shortlinkData,
      transaction,
    );
  }

  async updateShortlink(
    userId: string,
    id: string,
    payload: UpdateShortlinkDto,
    transaction?: Transaction,
  ): Promise<boolean> {
    const shortlink = await this.shortlinkRepository.getShortlinkById(id);
    if (!shortlink) {
      throw new NotFoundException('Shortlink not found');
    }

    if (shortlink.user_id !== userId) {
      throw new UnauthorizedException(
        'Not authorized to update this shortlink',
      );
    }

    const updateData = {
      ...payload,
      expires_at: payload.expires_at ? new Date(payload.expires_at) : undefined,
    };

    await this.shortlinkRepository.updateShortlink(id, updateData, transaction);

    return true;
  }

  async deleteShortlink(userId: string, id: string): Promise<boolean> {
    const shortlink = await this.shortlinkRepository.getShortlinkById(id);
    if (!shortlink) {
      throw new NotFoundException('Shortlink not found');
    }

    if (shortlink.user_id !== userId) {
      throw new UnauthorizedException(
        'Not authorized to delete this shortlink',
      );
    }

    return await this.shortlinkRepository.deleteShortlink(id);
  }

  async getShortlinkDetail(
    userId: string,
    id: string,
  ): Promise<ShortlinkModel> {
    const shortlink = await this.shortlinkRepository.getShortlinkById(id);
    if (!shortlink) {
      throw new NotFoundException('Shortlink not found');
    }

    if (shortlink.user_id !== userId) {
      throw new UnauthorizedException('Not authorized to view this shortlink');
    }

    return shortlink;
  }

  async getUserShortlinks(
    userId: string,
    query: ShortlinkQueryDto,
  ): Promise<{
    data: ShortlinkModel[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, short_code, is_active } = query;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (short_code) {
      where.short_code = {
        [Op.iLike]: `%${short_code}%`,
      };
    }
    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    const { rows, count } = await this.shortlinkRepository.getUserShortlinks(
      userId,
      where,
      offset,
      limit,
    );

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }
}
