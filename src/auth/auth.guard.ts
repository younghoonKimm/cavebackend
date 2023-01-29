import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ERROR_JWT_EXPIRED } from 'src/common/constants/errorConstants';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtServie: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public validateToken(token: string) {
    try {
      const isToken = this.jwtServie.verify(token.toString(), {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      });

      return isToken;
    } catch (error) {
      if (error.message === ERROR_JWT_EXPIRED) {
        throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
      }

      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
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
