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
  async googleAuth(@Req() req, @Res() res) {
    console.log(req);
  }

  @Get('/google/callback') // 2
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: Request & { user: GoogleUser },
    @Res() res,
  ) {
    const { user } = req;
    const { email, picture, firstName, lastName } = user;

    const newUser = {
      socialPlatform: 'google' as SocialPlatforms,
      email: email,
      profileImg: picture,
      name: firstName + lastName,
    };

    const tokens = await this.authService.logInUser(newUser);
    const { accessToken, refreshToken } = tokens;

    res.cookie('CAV_ACC', accessToken, {
      // domain: 'localhost',
      path: '/',
      // httpOnly: true,
    });
    res.cookie('CAV_RFS', refreshToken, { path: '/' });

    return res.redirect('back');
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
