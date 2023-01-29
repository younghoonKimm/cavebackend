import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UserInputDto } from '../user/dto/user.dto';
import { AccessTokenGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Token } from './decorator/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
