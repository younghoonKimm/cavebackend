import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SocketGuard implements CanActivate {
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
      return false;
    }
  }

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    let client = context.switchToWs().getClient();
    const accessToken = client.handshake.headers.cookie.split('CAV_ACC=')[1];

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
