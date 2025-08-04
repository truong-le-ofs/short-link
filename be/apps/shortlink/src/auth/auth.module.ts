import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel, UserSessionModel } from '@libs/database/sequelize/models';
import { EShortLinkConnection } from '@libs/common/enum';
import { AuthService } from './auth.service';
import { UserRepository } from './repository/user.repository';
import { UserSessionRepository } from './repository/user-session.repository';
import { UserJwtStrategy } from '@libs/common/strategy';

@Global()
@Module({
  imports: [
    SequelizeModule.forFeature(
      [UserModel, UserSessionModel],
      EShortLinkConnection.WRITER,
    ),
    SequelizeModule.forFeature(
      [UserModel, UserSessionModel],
      EShortLinkConnection.READER,
    ),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    UserSessionRepository,
    UserJwtStrategy,
  ],
  exports: [UserJwtStrategy],
})
export class AuthModule {}
