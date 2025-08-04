import { Controller, Get, Param, UseGuards, Req, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { UserAuthGuard } from '@libs/common/guards';
import { ShortlinkAnalyticsService } from '../services/shortlink-analytics.service';

@ApiTags('SHORTLINK ANALYTICS')
@ApiBearerAuth()
@UseGuards(UserAuthGuard)
@Controller('shortlinks')
export class ShortlinkAnalyticsController {
  constructor(private readonly analyticsService: ShortlinkAnalyticsService) {}

  @ApiOperation({
    summary: 'Get shortlink analytics',
    description: 'Get detailed analytics for a specific shortlink',
  })
  @ApiParam({
    name: 'shortlinkId',
    description: 'Shortlink ID',
    example: 'uuid-here',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Shortlink not found or not authorized',
  })
  @Get(':shortlinkId/analytics')
  async getShortlinkAnalytics(
    @Param('shortlinkId') shortlinkId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return await this.analyticsService.getShortlinkAnalytics(
      userId,
      shortlinkId,
    );
  }

  @ApiOperation({
    summary: 'Get user analytics',
    description: 'Get overall analytics for all user shortlinks',
  })
  @ApiResponse({
    status: 200,
    description: 'User analytics retrieved successfully',
  })
  @Get('analytics/overview')
  async getUserAnalytics(@Req() req: any) {
    const userId = req.user.id;
    return await this.analyticsService.getUserAnalytics(userId);
  }

  @ApiOperation({
    summary: 'Get access logs',
    description: 'Get detailed access logs for a specific shortlink',
  })
  @ApiParam({
    name: 'shortlinkId',
    description: 'Shortlink ID',
    example: 'uuid-here',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Access logs retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Shortlink not found or not authorized',
  })
  @Get(':shortlinkId/logs')
  async getAccessLogs(
    @Param('shortlinkId') shortlinkId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return await this.analyticsService.getAccessLogs(
      userId,
      shortlinkId,
      parseInt(page),
      parseInt(limit),
    );
  }
}
