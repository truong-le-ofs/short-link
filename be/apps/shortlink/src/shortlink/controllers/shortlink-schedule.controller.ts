import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ShortlinkScheduleService } from '../services/shortlink-schedule.service';
import { CreateScheduleDto, UpdateScheduleDto } from '../dto/shortlink.dto';
import {
  ScheduleResponseDto,
  ErrorResponseDto,
} from '../dto/shortlink.response.dto';
import { UserAuthGuard } from '@libs/common/guards';

@ApiTags('SHORTLINK SCHEDULE MANAGEMENT')
@ApiBearerAuth()
@UseGuards(UserAuthGuard)
@Controller('shortlinks')
export class ShortlinkScheduleController {
  constructor(
    private readonly shortlinkScheduleService: ShortlinkScheduleService,
  ) {}

  @ApiOperation({
    summary: 'Add schedule to shortlink',
    description:
      'Add time-based URL scheduling to change target URL during specific time periods',
  })
  @ApiParam({
    name: 'id',
    description: 'Shortlink ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Schedule created successfully',
    schema: { type: 'boolean', example: true },
  })
  @ApiResponse({
    status: 404,
    description: 'Shortlink not found',
    type: ErrorResponseDto,
  })
  @Post(':id/schedules')
  async addSchedule(
    @Param('id') id: string,
    @Body() payload: CreateScheduleDto,
    @Req() req,
  ) {
    const userId = req.user.id;

    return await this.shortlinkScheduleService.addSchedule(userId, id, payload);
  }

  @ApiOperation({
    summary: 'Get shortlink schedules',
    description: 'Get all time-based schedules for a shortlink',
  })
  @ApiParam({
    name: 'id',
    description: 'Shortlink ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedules retrieved successfully',
    type: [ScheduleResponseDto],
  })
  @Get(':id/schedules')
  async getShortlinkSchedules(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;

    return await this.shortlinkScheduleService.getShortlinkSchedules(
      userId,
      id,
    );
  }

  @ApiOperation({
    summary: 'Update schedule',
    description: 'Update an existing schedule for a shortlink',
  })
  @ApiParam({
    name: 'scheduleId',
    description: 'Schedule ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedule updated successfully',
    schema: { type: 'boolean', example: true },
  })
  @Put('schedules/:scheduleId')
  async updateSchedule(
    @Param('scheduleId') scheduleId: string,
    @Body() payload: UpdateScheduleDto,
    @Req() req,
  ) {
    const userId = req.user.id;

    return await this.shortlinkScheduleService.updateSchedule(
      userId,
      scheduleId,
      payload,
    );
  }

  @ApiOperation({
    summary: 'Delete schedule',
    description: 'Delete a schedule from a shortlink',
  })
  @ApiParam({
    name: 'scheduleId',
    description: 'Schedule ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedule deleted successfully',
    schema: { type: 'boolean', example: true },
  })
  @Delete('schedules/:scheduleId')
  async deleteSchedule(@Param('scheduleId') scheduleId: string, @Req() req) {
    const userId = req.user.id;

    return await this.shortlinkScheduleService.deleteSchedule(
      userId,
      scheduleId,
    );
  }
}
