import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ShortlinkRepository } from '../repository/shortlink.repository';
import { AccessShortlinkDto } from '../dto/shortlink.dto';

@Injectable()
export class ShortlinkAccessService {
  constructor(private readonly shortlinkRepository: ShortlinkRepository) {}

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
}
