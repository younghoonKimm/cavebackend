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
import { Response } from 'express';
import { GoogleUser } from 'src/types/auth';
import { SocialPlatforms } from 'src/user/entities/user.entity';
import { UserInputDto } from '../user/dto/user.dto';
import { AccessTokenGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Token } from './decorator/auth.decorator';
import { GoogleStrategy } from './GoogleStrategy';
import { cookieOption } from './helper';

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private googleStrategy: GoogleStrategy,
  ) {}

  @Get('/google') // 1
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req, @Res() res) {}

  @Get('/google/callback') // 2
  @UseGuards(AuthGuard('google'))
  @Header('Cache-Control', 'none')
  async googleAuthRedirect(
    @Req() req: Request & { user: GoogleUser },
    @Res({ passthrough: true }) res,
  ) {
    const { user } = req;
    const { email, picture, name } = user;

    const newUser = {
      socialPlatform: 'google' as SocialPlatforms,
      email: email,
      profileImg: picture,
      name,
    };

    const tokens = await this.authService.logInUser(newUser);
    const { accessToken, refreshToken } = tokens;

    res.cookie('CAV_ACC', accessToken, cookieOption);
    res.cookie('CAV_RFS', refreshToken, cookieOption);

    return res.redirect('/');
  }

  @Get('/getToken')
  @HttpCode(HttpStatus.OK)
  async createFreshToken(@Req() req, @Res({ passthrough: true }) res) {
    const oldRefreshToken = req?.cookies['CAV_RFS'];

    const tokens = await this.authService.createfreshToken(oldRefreshToken);

    const { accessToken, refreshToken } = tokens;

    res.cookie('CAV_ACC', accessToken, cookieOption);
    res.cookie('CAV_RFS', refreshToken, cookieOption);

    return tokens;
  }

  @Get('/logout')
  @Header('Cache-Control', 'none')
  @HttpCode(HttpStatus.PERMANENT_REDIRECT)
  async logOutUser(@Req() req, @Res({ passthrough: true }) res) {
    res.clearCookie('CAV_ACC');
    res.clearCookie('CAV_RFS');

    return res.redirect('/');
  }

  @UseGuards(AccessTokenGuard)
  @Get('/me')
  async getAccessToken(@Token() user: any) {
    const userProfile = await this.authService.getUser(user);
    return userProfile;
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
