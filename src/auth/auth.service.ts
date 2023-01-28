import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonOutput } from 'src/common/dto/common.dto';
import { UserInputDto } from 'src/user/dto/user.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthOutputDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userInfo: Repository<UserEntity>,
  ) {}

  async authLogin(data: UserInputDto): Promise<AuthOutputDto> {
    try {
      const { socialPlatform, providerId } = data;

      const isUser = await this.userInfo
        .createQueryBuilder('user_entity')
        .where(
          'user_entity.socialPlatform = :socialPlatform AND user_entity.providerId = :providerId',
          { socialPlatform, providerId },
        )
        .select(['user_entity.id', 'user_entity.providerId'])
        .getOne();

      if (isUser) {
        return { status: HttpStatus.CREATED, token: 'sdds' };
      } else {
        const newUser = await this.userInfo.save(
          this.userInfo.create({ ...data }),
        );

        console.log(newUser.id, newUser.providerId);
      }
    } catch {}
  }
}
