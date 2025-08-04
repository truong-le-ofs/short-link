import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { AccessShortlinkDto } from '../dto/shortlink.dto';
import {
  AccessResponseDto,
  ErrorResponseDto,
} from '../dto/shortlink.response.dto';
import { UserAuthGuard } from '@libs/common/guards';
import { ShortlinkAccessService } from '../services/shortlink-access.service';

@ApiTags('SHORTLINK ACCESS')
@ApiBearerAuth()
@UseGuards(UserAuthGuard)
@Controller('shortlinks')
export class ShortlinkController {
  constructor(
    private readonly shortlinkAccessService: ShortlinkAccessService,
  ) {}

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
    return await this.shortlinkAccessService.accessShortlink(
      shortCode,
      payload,
    );
  }

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
    const result = await this.shortlinkAccessService.accessShortlink(
      shortCode,
      {},
    );

    if (result.password_required) {
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

    return { url: result.target_url };
  }
}
