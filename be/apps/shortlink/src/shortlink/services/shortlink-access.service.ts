import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ShortlinkRepository } from '../repository/shortlink.repository';
import { ShortlinkAnalyticsService } from './shortlink-analytics.service';
import { AccessShortlinkDto } from '../dto/shortlink.dto';
import { Transaction } from 'sequelize';

@Injectable()
export class ShortlinkAccessService {
  constructor(
    private readonly shortlinkRepository: ShortlinkRepository,
    private readonly analyticsService: ShortlinkAnalyticsService,
  ) {}

  async accessShortlink(
    shortCode: string,
    payload: AccessShortlinkDto,
    request?: any,
    transaction?: Transaction,
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

    // Log the access for analytics (only for successful access)
    if (request) {
      try {
        await this.analyticsService.logAccessFromRequest(
          shortlink.id,
          request,
          transaction,
        );
      } catch (error) {
        // Don't fail the redirect if logging fails
        console.error('Failed to log access:', error);
      }
    }

    return {
      target_url: targetUrl,
      password_required: false,
    };
  }
}
