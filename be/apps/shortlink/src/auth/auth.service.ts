import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from './repository/user.repository';
import { UserSessionRepository } from './repository/user-session.repository';
import { UserModel, UserSessionModel } from '@libs/database/sequelize/models';
import { Transaction } from 'sequelize';
import * as bcrypt from 'bcrypt';
import { IUserJwtPayload } from '@libs/common/interfaces';
import { JwtStrategy } from '@libs/common/strategy/jwt.strategy';
import { DateDigit } from '@libs/common/enum';

export interface SignUpDto {
  email: string;
  password: string;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface SignInResponse {
  user: Partial<UserModel>;
  accessToken: string;
}

@Injectable()
export class AuthService {
  private readonly jwtService: JwtStrategy = new JwtStrategy(1, DateDigit.Day);
  private readonly secretToken: string;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly configService: ConfigService,
  ) {
    this.secretToken = this.configService.get('secret.token') || '';
  }

  async signUp(
    payload: SignUpDto,
    transaction?: Transaction,
  ): Promise<boolean> {
    const { email, password } = payload;

    await this.validateUserForSignUp({ email });

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = '000000';

    await this.userRepository.createUser(
      {
        email,
        password: hashedPassword,
        verification_token: verificationToken,
        is_verified: false,
      },
      transaction,
    );

    return true;
  }

  async signIn(
    payload: SignInDto,
    userAgent?: string,
    transaction?: Transaction,
  ): Promise<SignInResponse> {
    const { email, password } = payload;

    const user = await this.userRepository.getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create session for tracking
    await this.createUserSession(user.id, userAgent, transaction);

    // Generate accessToken
    const tokenPayload: IUserJwtPayload = {
      id: user.id,
      name: user.email,
    };

    const accessToken = this.jwtService.generate(
      tokenPayload,
      this.secretToken,
    );

    return {
      user: this.sanitizeUser(user),
      accessToken,
    };
  }

  private async createUserSession(
    userId: string,
    userAgent?: string,
    transaction?: Transaction,
  ): Promise<UserSessionModel> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    return await this.userSessionRepository.createUserSession(
      {
        user_id: userId,
        expires_at: expiresAt,
        user_agent: userAgent,
      },
      transaction,
    );
  }

  private async validateUserForSignUp(payload: {
    email: string;
  }): Promise<void> {
    const { email } = payload;

    const isEmailExisted = await this.userRepository.existedBy({ email });
    if (isEmailExisted) {
      throw new BadRequestException('Email already exists');
    }
  }

  private sanitizeUser(user: UserModel): Partial<UserModel> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, verification_token, ...sanitizedUser } = user.toJSON();

    return sanitizedUser;
  }
}
