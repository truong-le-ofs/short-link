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
import { CreatePasswordDto, AccessShortlinkDto } from '../dto/shortlink.dto';
import { ShortLinkPasswordModel } from '@libs/database/sequelize/models';

@Injectable()
export class ShortlinkPasswordService {
  constructor(
    private readonly shortlinkRepository: ShortlinkRepository,
    private readonly scheduleRepository: ShortlinkScheduleRepository,
    private readonly passwordRepository: ShortlinkPasswordRepository,
  ) {}
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

    const hashedPassword = await bcrypt.hash(payload.password, 12);

    const passwordData = {
      shortlink_id: shortlinkId,
      password: hashedPassword,
      start_time: payload.start_time ? new Date(payload.start_time) : undefined,
      end_time: payload.end_time ? new Date(payload.end_time) : undefined,
    };

    if (passwordData.start_time && passwordData.end_time) {
      if (passwordData.start_time >= passwordData.end_time) {
        throw new BadRequestException('Start time must be before end time');
      }
    }

    await this.passwordRepository.createPassword(passwordData, transaction);

    return true;
  }

  async removePassword(userId: string, passwordId: string): Promise<boolean> {
    const password = await this.passwordRepository.getPasswordById(passwordId);
    if (!password) {
      throw new NotFoundException('Password protection not found');
    }

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

  async accessShortlink(
    shortCode: string,
    payload: AccessShortlinkDto,
  ): Promise<{ target_url: string; password_required: boolean }> {
    const shortlink =
      await this.shortlinkRepository.getShortlinkByCode(shortCode);

    if (!shortlink) {
      throw new NotFoundException('Shortlink not found or expired');
    }

    const activePasswords = shortlink.passwords || [];
    if (activePasswords.length > 0) {
      if (!payload.password) {
        return {
          target_url: '',
          password_required: true,
        };
      }

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

    let targetUrl = shortlink.default_url;
    const activeSchedules = shortlink.schedules || [];

    if (activeSchedules.length > 0) {
      targetUrl = activeSchedules[0].target_url;
    }

    return {
      target_url: targetUrl,
      password_required: false,
    };
  }

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
