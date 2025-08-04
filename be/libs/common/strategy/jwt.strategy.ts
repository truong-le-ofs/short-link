import { DateDigit } from '@libs/common/enum';
import * as jwt from 'jsonwebtoken';
import { DatetimeHelper } from '../helper';
import { IUserJwtPayload } from '@libs/common/interfaces';

export class JwtStrategy {
  expiredPeriod: number;
  expiredDigit: DateDigit;
  constructor(expiredPeriod: number, expiredDigit: DateDigit) {
    this.expiredPeriod = expiredPeriod;
    this.expiredDigit = expiredDigit;
  }

  generate(payload: object, secretKey: string): string {
    return jwt.sign(
      {
        ...payload,
        exp: DatetimeHelper.convertDateToSecond(
          DatetimeHelper.addTime(this.expiredPeriod, this.expiredDigit),
        ),
      },
      secretKey,
    );
  }

  static decode(token: string): IUserJwtPayload {
    return jwt.decode(token) as IUserJwtPayload;
  }

  static verify(token: string, secretKeyJwt: string) {
    return jwt.verify(token, secretKeyJwt, { ignoreExpiration: false });
  }
}
