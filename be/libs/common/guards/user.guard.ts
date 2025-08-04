import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserJwtStrategy } from '../strategy';
import { IUserJwtPayload } from '@libs/common/interfaces';
import { Reflector } from '@nestjs/core';

@Injectable()
export class UserAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly userJwtStrategy: UserJwtStrategy,
  ) {
    super();
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Thông tin xác thực thất bại');
    }

    const token: string = authHeader.split(' ')[1];
    const user: IUserJwtPayload = this.userJwtStrategy.execute(token);

    if (!user) {
      throw new UnauthorizedException('Thông tin xác thực thất bại');
    }
    request.user = user;

    this.handleRequest(null, user);

    return true;
  }

  handleRequest<TUser = any>(_err: any, user: any): TUser {
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
