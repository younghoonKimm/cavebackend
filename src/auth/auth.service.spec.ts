import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authController: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;
  let userEntitiy: Repository<UserEntity>;
  let configService: ConfigService;

  beforeEach(() => {
    jwtService = new JwtService();
    authService = new AuthService(userEntitiy, jwtService, configService);
    authController = new AuthController(authService);
  });

  describe('getUser', () => {
    it('should return User', async () => {
      const user = { name: 'dummy', email: 'dummy' };
      const result = {
        user: { name: 'dummy', email: 'dummy', profileImg: 'dummy' },
      };
      jest
        .spyOn(authService, 'getUser')
        .mockImplementation(
          (user) => new Promise((resolve, reject) => resolve(result)),
        );
      expect(await authController.getUser(user)).toBe(result);
    });
  });
});
