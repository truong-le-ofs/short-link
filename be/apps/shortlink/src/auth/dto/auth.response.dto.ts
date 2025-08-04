import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
  })
  username: string;

  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Email verification status',
    example: false,
  })
  is_verified: boolean;

  @ApiProperty({
    description: 'Account creation date',
    example: '2023-12-01T10:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Account last update date',
    example: '2023-12-01T10:30:00Z',
  })
  updated_at: Date;
}

export class SessionResponseDto {
  @ApiProperty({
    description: 'Session ID',
    example: '987fcdeb-51a2-4d1f-8c3e-9876543210ab',
  })
  id: string;

  @ApiProperty({
    description: 'Session expiration date',
    example: '2023-12-08T10:30:00Z',
  })
  expires_at: Date;

  @ApiProperty({
    description: 'User agent information',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    required: false,
  })
  user_agent?: string;

  @ApiProperty({
    description: 'User ID associated with session',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  user_id: string;

  @ApiProperty({
    description: 'Session creation date',
    example: '2023-12-01T10:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Session last update date',
    example: '2023-12-01T10:30:00Z',
  })
  updated_at: Date;
}

export class SignInResponseDto {
  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
}

export class SignUpResponseDto {
  @ApiProperty({
    description: 'Registration success status',
    example: true,
    type: 'boolean',
  })
  data: boolean;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Username already exists',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error: string;
}
