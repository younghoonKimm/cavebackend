import { Column, Entity } from 'typeorm';
import { IsString, IsEnum, Length } from 'class-validator';
import { CommonEntitiy } from 'src/common/entity/common.entity';

export enum SocialPlatforms {
  Google = 'google',
  Kakao = 'kakao',
  Apple = 'apple',
  Naver = 'naver',
}

@Entity()
export class UserEntity extends CommonEntitiy {
  @Column({ length: 10 })
  @IsString()
  socialPlatform: SocialPlatforms;

  @Column({ length: 40, nullable: true })
  @IsString()
  email?: string;

  @Column({ length: 40, default: 'noname' })
  @IsString()
  name: string;

  @Column({ nullable: true })
  @IsString()
  profileImg?: string;

  @Column({ nullable: true, length: 20 })
  @IsString()
  phoneNumber?: string;

  @Column({ nullable: true, length: 1000 })
  @IsString()
  hashRT?: string;
}
