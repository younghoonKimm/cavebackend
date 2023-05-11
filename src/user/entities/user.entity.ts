import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { IsString, IsNumber } from 'class-validator';
import { CommonEntitiy } from 'src/common/entity/common.entity';
import { ConferenceEntity } from 'src/conference/entities/conference.entity';

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

  @Column({ length: 40, nullable: true })
  @IsString()
  name: string;

  @Column({ nullable: true })
  @IsString()
  profileImg?: string;

  @Column({ nullable: true, length: 20 })
  @IsString()
  phoneNumber?: string;

  @Column({ nullable: true, default: 0 })
  @IsNumber()
  darkMode?: 0 | 1;

  @ManyToMany(() => ConferenceEntity, (conference) => conference.users, {})
  conferences: ConferenceEntity[];

  @Column({ nullable: true, length: 3000 })
  @IsString()
  hashRT?: string;
}
