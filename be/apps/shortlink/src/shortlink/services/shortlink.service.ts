import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Transaction } from 'sequelize';
import * as bcrypt from 'bcrypt';
import { ShortlinkRepository } from '../repository/shortlink.repository';
import { ShortlinkScheduleRepository } from '../repository/shortlink-schedule.repository';
import { ShortlinkPasswordRepository } from '../repository/shortlink-password.repository';
import {
  CreateShortlinkDto,
  UpdateShortlinkDto,
  CreateScheduleDto,
  UpdateScheduleDto,
  CreatePasswordDto,
  AccessShortlinkDto,
  ShortlinkQueryDto,
} from '../dto/shortlink.dto';
import {
  ShortlinkModel,
  ShortLinkScheduleModel,
  ShortLinkPasswordModel,
} from '@libs/database/sequelize/models';
import { Op } from 'sequelize';

@Injectable()
export class ShortlinkService {
  constructor(
    private readonly shortlinkRepository: ShortlinkRepository,
    private readonly scheduleRepository: ShortlinkScheduleRepository,
    private readonly passwordRepository: ShortlinkPasswordRepository,
  ) {}

  // T�o shortlink m�i
  async createShortlink(
    userId: string,
    payload: CreateShortlinkDto,
    transaction?: Transaction,
  ): Promise<ShortlinkModel> {
    let shortCode = payload.short_code;

    // N�u kh�ng cung c�p short_code, t� �ng t�o
    if (!shortCode) {
      shortCode = await this.shortlinkRepository.generateUniqueShortCode();
    } else {
      // Ki�m tra short_code � t�n t�i ch�a
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

  // C�p nh�t shortlink - c� th� thay �i target URL m� kh�ng thay �i short link
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

  // X�a shortlink
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

  // L�y chi ti�t shortlink
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

  // L�y danh s�ch shortlink c�a user
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

  // Th�m l�ch tr�nh cho shortlink - thay �i target URL theo khung th�i gian
  async addSchedule(
    userId: string,
    shortlinkId: string,
    payload: CreateScheduleDto,
    transaction?: Transaction,
  ): Promise<boolean> {
    const shortlink =
      await this.shortlinkRepository.getShortlinkById(shortlinkId);
    if (!shortlink) {
      throw new NotFoundException('Shortlink not found');
    }

    if (shortlink.user_id !== userId) {
      throw new UnauthorizedException(
        'Not authorized to modify this shortlink',
      );
    }

    const scheduleData = {
      ...payload,
      shortlink_id: shortlinkId,
      start_time: new Date(payload.start_time),
      end_time: new Date(payload.end_time),
    };

    // Validate th�i gian
    if (scheduleData.start_time >= scheduleData.end_time) {
      throw new BadRequestException('Start time must be before end time');
    }

    await this.scheduleRepository.createSchedule(scheduleData, transaction);

    return true;
  }

  // C�p nh�t l�ch tr�nh
  async updateSchedule(
    userId: string,
    scheduleId: string,
    payload: UpdateScheduleDto,
    transaction?: Transaction,
  ): Promise<boolean> {
    const schedule = await this.scheduleRepository.getScheduleById(scheduleId);
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Ki�m tra quy�n s� h�u shortlink
    const shortlink = await this.shortlinkRepository.getShortlinkById(
      schedule.shortlink_id,
    );
    if (shortlink.user_id !== userId) {
      throw new UnauthorizedException('Not authorized to modify this schedule');
    }

    const updateData = {
      ...payload,
      start_time: payload.start_time ? new Date(payload.start_time) : undefined,
      end_time: payload.end_time ? new Date(payload.end_time) : undefined,
    };

    await this.scheduleRepository.updateSchedule(
      scheduleId,
      updateData,
      transaction,
    );

    return true;
  }

  // X�a l�ch tr�nh
  async deleteSchedule(userId: string, scheduleId: string): Promise<boolean> {
    const schedule = await this.scheduleRepository.getScheduleById(scheduleId);
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Ki�m tra quy�n s� h�u shortlink
    const shortlink = await this.shortlinkRepository.getShortlinkById(
      schedule.shortlink_id,
    );
    if (shortlink.user_id !== userId) {
      throw new UnauthorizedException('Not authorized to delete this schedule');
    }

    return await this.scheduleRepository.deleteSchedule(scheduleId);
  }

  // Th�m m�t kh�u b�o v� cho shortlink
  async addPassword(
    userId: string,
    shortlinkId: string,
    payload: CreatePasswordDto,
    transaction?: Transaction,
  ): Promise<boolean> {
    const shortlink =
      await this.shortlinkRepository.getShortlinkById(shortlinkId);
    if (!shortlink) {
      throw new NotFoundException('Shortlink not found');
    }

    if (shortlink.user_id !== userId) {
      throw new UnauthorizedException(
        'Not authorized to modify this shortlink',
      );
    }

    // Hash m�t kh�u
    const hashedPassword = await bcrypt.hash(payload.password, 12);

    const passwordData = {
      shortlink_id: shortlinkId,
      password: hashedPassword,
      start_time: payload.start_time ? new Date(payload.start_time) : undefined,
      end_time: payload.end_time ? new Date(payload.end_time) : undefined,
    };

    // Validate th�i gian n�u c�
    if (passwordData.start_time && passwordData.end_time) {
      if (passwordData.start_time >= passwordData.end_time) {
        throw new BadRequestException('Start time must be before end time');
      }
    }

    await this.passwordRepository.createPassword(passwordData, transaction);

    return true;
  }

  // X�a m�t kh�u b�o v�
  async removePassword(userId: string, passwordId: string): Promise<boolean> {
    const password = await this.passwordRepository.getPasswordById(passwordId);
    if (!password) {
      throw new NotFoundException('Password protection not found');
    }

    // Ki�m tra quy�n s� h�u shortlink
    const shortlink = await this.shortlinkRepository.getShortlinkById(
      password.shortlink_id,
    );
    if (shortlink.user_id !== userId) {
      throw new UnauthorizedException(
        'Not authorized to remove this password protection',
      );
    }

    return await this.passwordRepository.deletePassword(passwordId);
  }

  // Truy c�p shortlink - x� l� t�t c� logic ki�m tra
  async accessShortlink(
    shortCode: string,
    payload: AccessShortlinkDto,
  ): Promise<{ target_url: string; password_required: boolean }> {
    const shortlink =
      await this.shortlinkRepository.getShortlinkByCode(shortCode);

    if (!shortlink) {
      throw new NotFoundException('Shortlink not found or expired');
    }

    // Ki�m tra c� password protection kh�ng
    const activePasswords = shortlink.passwords || [];
    if (activePasswords.length > 0) {
      if (!payload.password) {
        return {
          target_url: '',
          password_required: true,
        };
      }

      // Ki�m tra m�t kh�u
      let passwordValid = false;
      for (const passwordRecord of activePasswords) {
        const isValid = await bcrypt.compare(
          payload.password,
          passwordRecord.password,
        );
        if (isValid) {
          passwordValid = true;
          break;
        }
      }

      if (!passwordValid) {
        throw new UnauthorizedException('Invalid password');
      }
    }

    // X�c �nh target URL d�a tr�n schedule
    let targetUrl = shortlink.default_url;
    const activeSchedules = shortlink.schedules || [];

    if (activeSchedules.length > 0) {
      // L�y schedule �u ti�n (� ��c s�p x�p theo th�i gian)
      targetUrl = activeSchedules[0].target_url;
    }

    return {
      target_url: targetUrl,
      password_required: false,
    };
  }

  // L�y danh s�ch l�ch tr�nh c�a shortlink
  async getShortlinkSchedules(
    userId: string,
    shortlinkId: string,
  ): Promise<ShortLinkScheduleModel[]> {
    const shortlink =
      await this.shortlinkRepository.getShortlinkById(shortlinkId);
    if (!shortlink) {
      throw new NotFoundException('Shortlink not found');
    }

    if (shortlink.user_id !== userId) {
      throw new UnauthorizedException('Not authorized to view this shortlink');
    }

    return await this.scheduleRepository.getSchedulesByShortlinkId(shortlinkId);
  }

  // L�y danh s�ch password protection c�a shortlink
  async getShortlinkPasswords(
    userId: string,
    shortlinkId: string,
  ): Promise<ShortLinkPasswordModel[]> {
    const shortlink =
      await this.shortlinkRepository.getShortlinkById(shortlinkId);
    if (!shortlink) {
      throw new NotFoundException('Shortlink not found');
    }

    if (shortlink.user_id !== userId) {
      throw new UnauthorizedException('Not authorized to view this shortlink');
    }

    return await this.passwordRepository.getPasswordsByShortlinkId(shortlinkId);
  }
}
