export interface IJwtPayload {
  jwtSecretExpirePeriod: string;
  jwtRefreshSecretExpirePeriod: string;
}

export interface IAuthJwtPayload {
  iat?: number;
  exp?: number;
}

export interface IUserJwtPayload extends IAuthJwtPayload {
  id: string;
  name: string;
}
