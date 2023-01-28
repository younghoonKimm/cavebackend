import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserInputDto } from '../user/dto/user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @HttpCode(HttpStatus.CREATED)
  async logInUser(
    @Body()
    data: UserInputDto,
  ) {
    return this.authService.logInUser(data);
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logOutUser() {
    return this.authService.logOutUser();
  }

  @UseGuards()
  @Get('/at')
  async getAccessToken() {}
}
