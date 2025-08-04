import { IUserJwtPayload } from '@libs/common/interfaces';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class UserJwtStrategy {
  private readonly secretKey = process.env.SECRET_TOKEN;

  constructor() {}

  private decodeJwt(token: string) {
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken) {
      throw new BadRequestException('Token không hợp lệ');
    }

    return decodedToken;
  }

  private validate(token: string): IUserJwtPayload {
    const decodedToken = this.decodeJwt(token);
    const payload: IUserJwtPayload = decodedToken.payload;

    jwt.verify(token, this.secretKey, {
      ignoreExpiration: false,
    });

    return payload;
  }

  execute(token: string): IUserJwtPayload {
    try {
      const user = this.validate(token);

      return user;
    } catch (err) {
      throw new UnauthorizedException(err.message);
    }
  }
}
