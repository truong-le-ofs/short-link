import { ApiProperty } from '@nestjs/swagger';

export class ShortlinkResponseDto {
  @ApiProperty({
    description: 'Shortlink ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Short code',
    example: 'abc123',
  })
  short_code: string;

  @ApiProperty({
    description: 'Default target URL',
    example: 'https://google.com',
  })
  default_url: string;

  @ApiProperty({
    description: 'Active status',
    example: true,
  })
  is_active: boolean;

  @ApiProperty({
    description: 'Expiration date',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  expires_at?: Date;

  @ApiProperty({
    description: 'Access limit',
    example: 100,
    required: false,
  })
  access_limit?: number;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  user_id: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00Z',
  })
  updated_at: Date;
}

export class ScheduleResponseDto {
  @ApiProperty({
    description: 'Schedule ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Target URL for this schedule',
    example: 'https://special-event.com',
  })
  target_url: string;

  @ApiProperty({
    description: 'Start time',
    example: '2024-01-01T00:00:00Z',
  })
  start_time: Date;

  @ApiProperty({
    description: 'End time',
    example: '2024-01-31T23:59:59Z',
  })
  end_time: Date;

  @ApiProperty({
    description: 'Shortlink ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  shortlink_id: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00Z',
  })
  updated_at: Date;
}

export class PasswordResponseDto {
  @ApiProperty({
    description: 'Password ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Start time for password protection',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  start_time?: Date;

  @ApiProperty({
    description: 'End time for password protection',
    example: '2024-01-31T23:59:59Z',
    required: false,
  })
  end_time?: Date;

  @ApiProperty({
    description: 'Shortlink ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  shortlink_id: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-01T00:00:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00Z',
  })
  updated_at: Date;
}

export class ShortlinkDetailResponseDto extends ShortlinkResponseDto {
  @ApiProperty({
    description: 'Scheduled redirects',
    type: [ScheduleResponseDto],
  })
  schedules: ScheduleResponseDto[];

  @ApiProperty({
    description: 'Password protections',
    type: [PasswordResponseDto],
  })
  passwords: PasswordResponseDto[];
}

export class PaginatedShortlinkResponseDto {
  @ApiProperty({
    description: 'Shortlinks data',
    type: [ShortlinkResponseDto],
  })
  data: ShortlinkResponseDto[];

  @ApiProperty({
    description: 'Total count',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total pages',
    example: 10,
  })
  totalPages: number;
}

export class AccessResponseDto {
  @ApiProperty({
    description: 'Target URL to redirect to',
    example: 'https://google.com',
  })
  target_url: string;

  @ApiProperty({
    description: 'Whether password is required',
    example: false,
  })
  password_required: boolean;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Shortlink not found',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error: string;
}
