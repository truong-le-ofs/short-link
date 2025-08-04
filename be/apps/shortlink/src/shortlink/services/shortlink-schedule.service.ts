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
import { CreateScheduleDto, UpdateScheduleDto } from '../dto/shortlink.dto';
import { ShortLinkScheduleModel } from '@libs/database/sequelize/models';

@Injectable()
export class ShortlinkScheduleService {
  constructor(
    private readonly shortlinkRepository: ShortlinkRepository,
    private readonly scheduleRepository: ShortlinkScheduleRepository,
    private readonly passwordRepository: ShortlinkPasswordRepository,
  ) {}
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

  async deleteSchedule(userId: string, scheduleId: string): Promise<boolean> {
    const schedule = await this.scheduleRepository.getScheduleById(scheduleId);
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    const shortlink = await this.shortlinkRepository.getShortlinkById(
      schedule.shortlink_id,
    );
    if (shortlink.user_id !== userId) {
      throw new UnauthorizedException('Not authorized to delete this schedule');
    }

    return await this.scheduleRepository.deleteSchedule(scheduleId);
  }

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
}
