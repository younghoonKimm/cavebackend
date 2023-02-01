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
import { GoogleUser } from 'src/types/auth';
import { SocialPlatforms } from 'src/user/entities/user.entity';
import { UserInputDto } from '../user/dto/user.dto';
import { AccessTokenGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Token } from './decorator/auth.decorator';
import { GoogleStrategy } from './GoogleStrategy';

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

    res.cookie('CAV_ACC', accessToken, {
      domain: 'localhost',
      path: '/',
      overwrite: true,
      // httpOnly: true,
    });
    res.cookie('CAV_RFS', refreshToken, {
      domain: 'localhost',
      path: '/',
      overwrite: true,
      // httpOnly: true,
    });

    return res.redirect('/');
  }

  // @Post('/login')
  // @HttpCode(HttpStatus.CREATED)
  // async logInUser(
  //   @Body()
  //   data: UserInputDto,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   const tokens = await this.authService.logInUser(data);
  //   const { accessToken, refreshToken } = tokens;

  //   response.cookie('CAV_ACC', accessToken, {
  //     domain: 'localhost',
  //     path: '/',
  //     // httpOnly: true,
  //   });
  //   response.cookie('CAV_RFS', refreshToken, {
  //     domain: 'localhost',
  //     path: '/',
  //     // httpOnly: true,
  //   });
  //   return tokens;
  // }

  @Get('/getToken')
  @HttpCode(HttpStatus.OK)
  async createFreshToken(@Req() req, @Res({ passthrough: true }) res) {
    const oldRefreshToken = req;

    const tokens = await this.authService.createfreshToken(oldRefreshToken);
    const { accessToken, refreshToken } = tokens;

    res.cookie('CAV_ACC', accessToken, {
      domain: 'localhost',
      path: '/',
      overwrite: true,
      // httpOnly: true,
    });
    res.cookie('CAV_RFS', refreshToken, {
      domain: 'localhost',
      path: '/',
      overwrite: true,
      // httpOnly: true,
    });

    return tokens;
  }

  @Get('/logout')
  @HttpCode(HttpStatus.OK)
  async logOutUser(@Req() req, @Res() response) {
    response.clearCookie('CAV_ACC');
    response.clearCookie('CAV_RFS');
    response.redirect('/');
    return;
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
}
