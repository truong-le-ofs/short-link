import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
import { ShortlinkService } from '../services/shortlink.service';
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
  ShortlinkResponseDto,
  ShortlinkDetailResponseDto,
  PaginatedShortlinkResponseDto,
  ScheduleResponseDto,
  PasswordResponseDto,
  AccessResponseDto,
  ErrorResponseDto,
} from '../dto/shortlink.response.dto';
import { UserAuthGuard } from '@libs/common/guards';

@ApiBearerAuth()
@UseGuards(UserAuthGuard)
@Controller('shortlinks')
export class ShortlinkController {
  constructor(private readonly shortlinkService: ShortlinkService) {}

  @ApiTags('SHORTLINK MANAGEMENT')
  @ApiOperation({
    summary: 'Create new shortlink',
    description:
      'Create a new shortlink with optional custom short code, expiration and access limit',
  })
  @ApiResponse({
    status: 201,
    description: 'Shortlink created successfully',
    type: ShortlinkResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or short code already exists',
    type: ErrorResponseDto,
  })
  @Post()
  async createShortlink(@Body() payload: CreateShortlinkDto, @Req() req) {
    const userId = req.user.id;

    return await this.shortlinkService.createShortlink(userId, payload);
  }

  @ApiTags('SHORTLINK MANAGEMENT')
  @ApiOperation({
    summary: 'Get user shortlinks',
    description:
      'Get paginated list of user shortlinks with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Shortlinks retrieved successfully',
    type: PaginatedShortlinkResponseDto,
  })
  @Get()
  async getUserShortlinks(@Query() query: ShortlinkQueryDto, @Req() req) {
    const userId = req.user.id;

    return await this.shortlinkService.getUserShortlinks(userId, query);
  }

  @ApiTags('SHORTLINK MANAGEMENT')
  @ApiOperation({
    summary: 'Get shortlink details',
    description:
      'Get detailed information about a shortlink including schedules and passwords',
  })
  @ApiParam({
    name: 'id',
    description: 'Shortlink ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Shortlink details retrieved successfully',
    type: ShortlinkDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Shortlink not found',
    type: ErrorResponseDto,
  })
  @Get(':id')
  async getShortlinkDetail(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;

    return await this.shortlinkService.getShortlinkDetail(userId, id);
  }

  @ApiTags('SHORTLINK MANAGEMENT')
  @ApiOperation({
    summary: 'Update shortlink',
    description:
      'Update shortlink properties including target URL without changing short code',
  })
  @ApiParam({
    name: 'id',
    description: 'Shortlink ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Shortlink updated successfully',
    schema: { type: 'boolean', example: true },
  })
  @ApiResponse({
    status: 404,
    description: 'Shortlink not found',
    type: ErrorResponseDto,
  })
  @Put(':id')
  async updateShortlink(
    @Param('id') id: string,
    @Body() payload: UpdateShortlinkDto,
    @Req() req,
  ) {
    const userId = req.user.id;

    return await this.shortlinkService.updateShortlink(userId, id, payload);
  }

  @ApiTags('SHORTLINK MANAGEMENT')
  @ApiOperation({
    summary: 'Delete shortlink',
    description: 'Delete a shortlink permanently',
  })
  @ApiParam({
    name: 'id',
    description: 'Shortlink ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Shortlink deleted successfully',
    schema: { type: 'boolean', example: true },
  })
  @ApiResponse({
    status: 404,
    description: 'Shortlink not found',
    type: ErrorResponseDto,
  })
  @Delete(':id')
  async deleteShortlink(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;

    return await this.shortlinkService.deleteShortlink(userId, id);
  }

  @ApiTags('SHORTLINK SCHEDULE MANAGEMENT')
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

    return await this.shortlinkService.addSchedule(userId, id, payload);
  }

  @ApiTags('SHORTLINK SCHEDULE MANAGEMENT')
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

    return await this.shortlinkService.getShortlinkSchedules(userId, id);
  }

  @ApiTags('SHORTLINK SCHEDULE MANAGEMENT')
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

    return await this.shortlinkService.updateSchedule(
      userId,
      scheduleId,
      payload,
    );
  }

  @ApiTags('SHORTLINK SCHEDULE MANAGEMENT')
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

    return await this.shortlinkService.deleteSchedule(userId, scheduleId);
  }

  @ApiTags('SHORTLINK PASSWORD MANAGEMENT')
  @ApiOperation({
    summary: 'Add password protection',
    description:
      'Add password protection to a shortlink with optional time-based activation',
  })
  @ApiParam({
    name: 'id',
    description: 'Shortlink ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 201,
    description: 'Password protection created successfully',
    schema: { type: 'boolean', example: true },
  })
  @Post(':id/passwords')
  async addPassword(
    @Param('id') id: string,
    @Body() payload: CreatePasswordDto,
    @Req() req,
  ) {
    const userId = req.user.id;

    return await this.shortlinkService.addPassword(userId, id, payload);
  }

  @ApiTags('SHORTLINK PASSWORD MANAGEMENT')
  @ApiOperation({
    summary: 'Get shortlink password protections',
    description: 'Get all password protections for a shortlink',
  })
  @ApiParam({
    name: 'id',
    description: 'Shortlink ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Password protections retrieved successfully',
    type: [PasswordResponseDto],
  })
  @Get(':id/passwords')
  async getShortlinkPasswords(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;

    return await this.shortlinkService.getShortlinkPasswords(userId, id);
  }

  @ApiTags('SHORTLINK PASSWORD MANAGEMENT')
  @ApiOperation({
    summary: 'Remove password protection',
    description: 'Remove password protection from a shortlink',
  })
  @ApiParam({
    name: 'passwordId',
    description: 'Password ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Password protection removed successfully',
    schema: { type: 'boolean', example: true },
  })
  @Delete('passwords/:passwordId')
  async removePassword(@Param('passwordId') passwordId: string, @Req() req) {
    const userId = req.user.id;

    return await this.shortlinkService.removePassword(userId, passwordId);
  }

  @ApiOperation({
    summary: 'Access shortlink',
    description:
      'Access a shortlink and get target URL or password requirement',
  })
  @ApiParam({
    name: 'shortCode',
    description: 'Short code',
    example: 'abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Shortlink accessed successfully',
    type: AccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Shortlink not found or expired',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid password',
    type: ErrorResponseDto,
  })
  @Post('s/:shortCode')
  async accessShortlink(
    @Param('shortCode') shortCode: string,
    @Body() payload: AccessShortlinkDto,
  ) {
    return await this.shortlinkService.accessShortlink(shortCode, payload);
  }

  // Redirect shortlink (public endpoint) - GET request for direct browser access
  @ApiOperation({
    summary: 'Redirect shortlink',
    description:
      'Direct browser redirect to target URL (for links without password)',
  })
  @ApiParam({
    name: 'shortCode',
    description: 'Short code',
    example: 'abc123',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirect to target URL',
  })
  @ApiResponse({
    status: 404,
    description: 'Shortlink not found, expired, or password required',
  })
  @Get('s/:shortCode')
  async redirectShortlink(@Param('shortCode') shortCode: string) {
    const result = await this.shortlinkService.accessShortlink(shortCode, {});

    if (result.password_required) {
      // If password is required, return HTML form or redirect to password page
      return `
        <html>
          <body>
            <h2>Password Required</h2>
            <p>This shortlink requires a password to access.</p>
            <form method="POST" action="/s/${shortCode}">
              <input type="password" name="password" placeholder="Enter password" required>
              <button type="submit">Access</button>
            </form>
          </body>
        </html>
      `;
    }

    // Redirect to target URL
    return { url: result.target_url };
  }
}
