import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import { UserInputDto } from 'src/user/dto/user.dto';
import { UserEntity } from 'src/user/entities/user.entity';

import { AuthOutputDto, AuthTokenOutput } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userInfo: Repository<UserEntity>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createToken(
    data: UserInputDto,
    secret: string,
    expiresIn: string,
  ): Promise<string> {
    return await this.jwtService.signAsync(
      { data },
      {
        secret,
        expiresIn,
      },
    );
  }

  createAccesToken(data: UserInputDto): Promise<string> {
    return this.createToken(
      data,
      this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      this.configService.get<string>('ACCESS_TOKEN_EXPIRATION'),
    );
  }

  createRefreshToken(data: UserInputDto): Promise<string> {
    return this.createToken(
      data,
      this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      this.configService.get<string>('REFRESH_TOKEN_EXPIRATION'),
    );
  }

  async createTokens(data: UserInputDto): Promise<AuthTokenOutput> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.createAccesToken(data),
        this.createRefreshToken(data),
      ]);

      return { accessToken, refreshToken };
    } catch {
      return { status: HttpStatus.INTERNAL_SERVER_ERROR };
    }
  }

  async logInUser(data: UserInputDto): Promise<AuthOutputDto> {
    try {
      const { socialPlatform, providerId } = data;
      let user: UserEntity;
      const isUser = await this.userInfo
        .createQueryBuilder('user_entity')
        .where(
          'user_entity.socialPlatform = :socialPlatform AND user_entity.providerId = :providerId',
          { socialPlatform, providerId },
        )
        .select(['user_entity.id', 'user_entity.providerId'])
        .getOne();

      if (isUser) {
        user = isUser;
      } else {
        user = await this.userInfo.save(this.userInfo.create({ ...data }));
      }

      const { accessToken, refreshToken } = await this.createTokens(user);

      this.updateRefreshToken(user, refreshToken);

      return { accessToken, refreshToken };
    } catch (error) {
      console.log(error);
      return {
        errorText: '토큰 발급 실패',
      };
    }
  }

  async logOutUser() {
    //logout
  }

  async updateRefreshToken(user: UserEntity, refreshToken: string) {
    await this.userInfo.save(
      this.userInfo.create({ ...user, hashRT: refreshToken }),
    );
  }

  async googleLogin() {}
}
