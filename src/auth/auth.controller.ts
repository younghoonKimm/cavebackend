import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  async getCategoryParent(
    @Body()
    data?: any,
  ) {
    return this.authService.authLogin(data);
  }
}
