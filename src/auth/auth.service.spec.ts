import { ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { rejects } from 'assert';
import { Response } from 'express';

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

  const user = { name: 'dummy', email: 'dummy' };
  const result = {
    user: { ...user, profileImg: 'dummy' },
  };

  describe('getUser', () => {
    it('should return User', async () => {
      jest.spyOn(authService, 'getUser').mockImplementation(
        (user) =>
          new Promise((resolve) => {
            if (user) {
              resolve(result);
            }
          }),
      );
      const res = await authController.getUser(user);

      expect(res).toBe(result);
    });

    it('should return 400 Error', async () => {
      jest.spyOn(authService, 'getUser').mockImplementation(
        (user) =>
          new Promise((_, reject) => {
            if (!user) {
              reject(() => {
                throw new Error('400');
              });
            }
          }),
      );

      const action = async () => await authController.getUser(null);

      expect(action()).rejects.toThrow('400');
    });
  });

  describe('logOut user', () => {
    it('should logout User', async () => {
      const res = {
        redirect: jest.fn(),
        clearCookie: (cookieName: string) => jest.fn(),
      };
      jest.spyOn(authService, 'logOutUser').mockImplementation(
        () =>
          new Promise((resolve) => {
            resolve();
            res.clearCookie('CAV_ACC');
            res.clearCookie('CAV_RFS');
          }),
      );
      expect(await authController.logOutUser(res)).toBe(res.redirect('/'));
    });
  });
});
