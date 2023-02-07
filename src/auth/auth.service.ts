import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

import { UserInputDto } from 'src/user/dto/user.dto';
import { UserEntity } from 'src/user/entities/user.entity';

import { AuthOutputDto, AuthTokenOutput } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { ERROR_JWT_EXPIRED } from 'src/common/constants/errorConstants';
import { returnTokenError } from 'src/utils/error/tokenError';

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

  async getUserData(user: UserInputDto) {
    const { id, email } = user;
    const isUser = await this.userInfo
      .createQueryBuilder('user_entity')
      .where('user_entity.id = :id AND user_entity.email = :email', {
        id,
        email,
      })
      .select([
        'user_entity.name',
        'user_entity.email',
        'user_entity.profileImg',
      ])
      .getOne();

    return isUser;
  }

  async logInUser(data: UserInputDto): Promise<AuthOutputDto> {
    try {
      const { socialPlatform, email } = data;
      let user: UserEntity;
      const isUser = await this.userInfo
        .createQueryBuilder('user_entity')
        .where(
          'user_entity.socialPlatform = :socialPlatform AND user_entity.email = :email',
          { socialPlatform, email },
        )
        .select(['user_entity.id', 'user_entity.email'])
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

  async updateRefreshToken(user: UserEntity, refreshToken: string) {
    await this.userInfo.save(
      this.userInfo.create({ ...user, hashRT: refreshToken }),
    );
  }

  async googleLogin(req) {
    if (req) {
      return 'we';
    } else {
      return 'sdds';
    }
  }

  async getUser(user: UserInputDto) {
    try {
      const userProfile = await this.getUserData(user);

      return { user: userProfile };
    } catch (error) {
      console.log(error);
    }
  }

  async createfreshToken(oldRefreshToken: string) {
    let userProfile;

    try {
      const { data } = await this.jwtService.verify(
        oldRefreshToken.toString(),
        {
          secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        },
      );

      const userData = await this.userInfo.findOne({
        where: {
          id: data.id,
          email: data.email,
        },
      });

      userProfile = userData;

      if (userProfile) {
        if (userProfile.hashRT === oldRefreshToken) {
          const accessToken = await this.createAccesToken({
            id: userProfile.id,
            email: userProfile.email,
          });
          return { accessToken, refreshToken: oldRefreshToken };
        }
      }
    } catch (error) {
      if (error.message === ERROR_JWT_EXPIRED) {
        const user = await this.getUserData(userProfile);
        if (user) {
          const { accessToken, refreshToken } = await this.createTokens(
            userProfile,
          );
          await this.updateRefreshToken(user, refreshToken);
          return { accessToken, refreshToken };
        } else {
          throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
        }
      } else {
        throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
      }
    }
  }

  async AllgetUser() {
    const users = await this.userInfo
      .createQueryBuilder('user_entity')
      .getMany();

    return users;
  }
}
