import {
  Controller,
  Get,
  Header,
  Headers,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { GoogleUser } from 'src/types/auth';
import { SocialPlatforms } from 'src/user/entities/user.entity';
import { AccessTokenGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Token } from './decorator/auth.decorator';
import { AuthTokenOutput } from './dto/auth.dto';
import { GoogleStrategy } from './GoogleStrategy';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/google') // 1
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req, @Res() res) {}

  @Get('/google/callback') // 2
  @UseGuards(AuthGuard('google'))
  @Header('Cache-Control', 'none')
  async googleAuthRedirect(
    @Req() req: Request & { user: GoogleUser },
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { user } = req;
    const { email, picture, name } = user;

    const newUser = {
      socialPlatform: 'google' as SocialPlatforms,
      email: email,
      profileImg: picture,
      name,
    };

    return await this.authService.logInUser(newUser, res);
  }

  @Get('/getToken')
  @HttpCode(HttpStatus.OK)
  async createFreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokenOutput> {
    const oldRefreshToken = req?.cookies['CAV_RFS'];

    return await this.authService.createfreshToken(oldRefreshToken, res);
  }

  @Get('/logout')
  @Header('Cache-Control', 'none')
  @HttpCode(HttpStatus.PERMANENT_REDIRECT)
  async logOutUser(@Res({ passthrough: true }) res): Promise<void> {
    return await this.authService.logOutUser(res);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/me')
  async getUser(@Token() user: any) {
    return await this.authService.getUser(user);
  }

  @Get('/a')
  async users() {
    return await this.authService.AllgetUser();
  }

  @Get('s')
  c() {
    return { text: 'abd' };
  }
}
