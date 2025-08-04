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
  ShortlinkQueryDto,
} from '../dto/shortlink.dto';
import {
  ShortlinkResponseDto,
  ShortlinkDetailResponseDto,
  PaginatedShortlinkResponseDto,
  ErrorResponseDto,
} from '../dto/shortlink.response.dto';
import { UserAuthGuard } from '@libs/common/guards';
@ApiTags('SHORTLINK MANAGEMENT')
@ApiBearerAuth()
@UseGuards(UserAuthGuard)
@Controller('shortlinks')
export class ShortlinkController {
  constructor(private readonly shortlinkService: ShortlinkService) {}

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
}
