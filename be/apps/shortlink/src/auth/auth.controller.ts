import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { AuthSignInDto, AuthSignUpDto } from './dto/auth.dto';
import { SignInResponseDto, ErrorResponseDto } from './dto/auth.response.dto';
import { AuthService } from './auth.service';

@ApiTags('AUTH MANAGEMENT')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'User sign in',
    description:
      'Authenticate user with email and password, returns user data and access token',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    type: SignInResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    type: ErrorResponseDto,
  })
  @Post('signin')
  async signin(@Body() payload: AuthSignInDto, @Req() req) {
    const userAgent = req.get('User-Agent');

    const result = await this.authService.signIn(
      {
        usernameOrEmail: payload.email,
        password: payload.password,
      },
      userAgent,
    );

    return result;
  }

  @ApiOperation({
    summary: 'User sign up',
    description: 'Create a new user account with username, email and password',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    schema: {
      type: 'boolean',
      example: true,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or user already exists',
    type: ErrorResponseDto,
  })
  @Post('signup')
  async signup(@Body() payload: AuthSignUpDto) {
    const result = await this.authService.signUp({
      username: payload.username,
      email: payload.email,
      password: payload.password,
    });

    return result;
  }
}
