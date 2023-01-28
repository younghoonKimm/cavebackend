import { Body, Controller, Post } from '@nestjs/common';
import { UserInputDto } from '../user/dto/user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  async getCategoryParent(
    @Body()
    data: UserInputDto,
  ) {
    return this.authService.authLogin(data);
  }
}
