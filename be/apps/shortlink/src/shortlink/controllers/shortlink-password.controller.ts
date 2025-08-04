import {
  Controller,
  Get,
  Post,
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
import { CreatePasswordDto } from '../dto/shortlink.dto';
import { PasswordResponseDto } from '../dto/shortlink.response.dto';
import { UserAuthGuard } from '@libs/common/guards';
import { ShortlinkPasswordService } from '../services/shortlink-password.service';

@ApiTags('SHORTLINK PASSWORD MANAGEMENT')
@ApiBearerAuth()
@UseGuards(UserAuthGuard)
@Controller('shortlinks')
export class ShortlinkPasswordController {
  constructor(
    private readonly shortlinkPasswordService: ShortlinkPasswordService,
  ) {}
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

    return await this.shortlinkPasswordService.addPassword(userId, id, payload);
  }

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

    return await this.shortlinkPasswordService.getShortlinkPasswords(
      userId,
      id,
    );
  }

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

    return await this.shortlinkPasswordService.removePassword(
      userId,
      passwordId,
    );
  }
}
