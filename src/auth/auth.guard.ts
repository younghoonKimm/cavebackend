import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { returnTokenError } from 'src/utils/error/tokenError';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtServie: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public validateToken(token: string) {
    try {
      const isTokenValid = this.jwtServie.verify(token.toString(), {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      });
      return isTokenValid.data;
    } catch (error) {
      returnTokenError(error);
    }
  }

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const { CAV_ACC: accessToken } = context
      .switchToHttp()
      .getRequest().cookies;

    if (accessToken === undefined) {
      return false;
    }

    const decodedToken = this.validateToken(accessToken);

    if (decodedToken) {
      request.user = decodedToken;
      return true;
    } else {
      return false;
    }
  }
}
