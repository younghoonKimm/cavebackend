import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { SocialPlatforms } from 'src/user/entities/user.entity';
import { UserInputDto } from '../user/dto/user.dto';
import { AccessTokenGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Token } from './decorator/auth.decorator';
import { GoogleStrategy } from './GoogleStrategy';

interface GoogleUser {
  provider: string;
  providerId: string;
  email: string;
  name: string;
}

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private googleStrategy: GoogleStrategy,
  ) {}

  @Get('/google') // 1
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req, @Res() res) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: Request & { user: GoogleUser },
    @Res() res: Response,
  ): Promise<any> {
    // ...
    const { user } = req;
    console.log(req.user);

    const tokens = await this.authService.logInUser({
      socialPlatform: 'google' as SocialPlatforms,
      ...user,
    });
    const { accessToken, refreshToken } = tokens;

    res.cookie('CAV_ACC', accessToken, {
      // domain: 'localhost',
      path: '/',
      // httpOnly: true,
    });
    res.cookie('CAV_RFS', refreshToken, { path: '/' });

    res.location('back');
    // const { user } = req;
    // return this.authService.googleLogin(user);
  }

  @Post('/login')
  @HttpCode(HttpStatus.CREATED)
  async logInUser(
    @Body()
    data: UserInputDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.logInUser(data);
    const { accessToken, refreshToken } = tokens;

    response.cookie('CAV_ACC', accessToken, {
      // domain: 'localhost',
      path: '/',
      // httpOnly: true,
    });
    response.cookie('CAV_RFS', refreshToken, { path: '/' });
    return tokens;
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logOutUser() {
    return this.authService.logOutUser();
  }

  @UseGuards(AccessTokenGuard)
  @Get('/at')
  async getAccessToken(@Token() token: any) {
    console.log(token, 2);
  }
}
