import {
  IsString,
  IsUrl,
  IsOptional,
  IsDateString,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShortlinkDto {
  @ApiProperty({
    description: 'Target URL to redirect to',
    example: 'https://google.com',
  })
  @IsUrl()
  @IsString()
  default_url: string;

  @ApiProperty({
    description: 'Custom short code (optional)',
    example: 'my-link',
    required: false,
  })
  @IsOptional()
  @IsString()
  short_code?: string;

  @ApiProperty({
    description: 'Expiration date (optional)',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @ApiProperty({
    description: 'Access limit (optional)',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  access_limit?: number;

  @ApiProperty({
    description: 'Meta tag for SEO and social sharing (optional)',
    example: '<meta property="og:title" content="My Title" />',
    required: false,
  })
  @IsOptional()
  @IsString()
  meta_tag?: string;
}

export class UpdateShortlinkDto {
  @ApiProperty({
    description: 'New target URL',
    example: 'https://updated-url.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  @IsString()
  default_url?: string;

  @ApiProperty({
    description: 'Active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    description: 'New expiration date',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @ApiProperty({
    description: 'New access limit',
    example: 200,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  access_limit?: number;

  @ApiProperty({
    description: 'Meta tag for SEO and social sharing (optional)',
    example: '<meta property="og:title" content="Updated Title" />',
    required: false,
  })
  @IsOptional()
  @IsString()
  meta_tag?: string;
}

export class CreateScheduleDto {
  @ApiProperty({
    description: 'Target URL for this time period',
    example: 'https://special-event.com',
  })
  @IsUrl()
  @IsString()
  target_url: string;

  @ApiProperty({
    description: 'Start time for this schedule',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  start_time: string;

  @ApiProperty({
    description: 'End time for this schedule',
    example: '2024-01-31T23:59:59Z',
  })
  @IsDateString()
  end_time: string;
}

export class UpdateScheduleDto {
  @ApiProperty({
    description: 'Target URL for this time period',
    example: 'https://updated-event.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  @IsString()
  target_url?: string;

  @ApiProperty({
    description: 'Start time for this schedule',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  start_time?: string;

  @ApiProperty({
    description: 'End time for this schedule',
    example: '2024-01-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  end_time?: string;
}

export class CreatePasswordDto {
  @ApiProperty({
    description: 'Password to protect the shortlink',
    example: 'mypassword123',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Start time for password protection (optional)',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  start_time?: string;

  @ApiProperty({
    description: 'End time for password protection (optional)',
    example: '2024-01-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  end_time?: string;
}

export class AccessShortlinkDto {
  @ApiProperty({
    description: 'Password for protected shortlink (optional)',
    example: 'mypassword123',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;
}

export class ShortlinkQueryDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Search by short code',
    example: 'my-link',
    required: false,
  })
  @IsOptional()
  @IsString()
  short_code?: string;

  @ApiProperty({
    description: 'Filter by active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;
}
