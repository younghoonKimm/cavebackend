import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { IsString, IsNumber } from 'class-validator';
import { CommonEntitiy } from 'src/common/entity/common.entity';
import { ConferenceEntity } from 'src/conference/entities/conference.entity';
import { CategoryEntitiy } from 'src/category/entities/category.entity';
import { ApiProperty } from '@nestjs/swagger';
import { FriendsEntity } from 'src/friends/entities/friends.entitiy';

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
  @ApiProperty({
    example: SocialPlatforms,
  })
  socialPlatform: SocialPlatforms;

  @Column({ length: 40, nullable: true })
  @IsString()
  @ApiProperty({
    example: 'email@google.com',
  })
  email?: string;

  @Column({ length: 140, nullable: true })
  @IsString()
  @ApiProperty({
    example: 'name',
  })
  name: string;

  @Column({ nullable: true })
  @IsString()
  @ApiProperty({
    example: 'string',
  })
  profileImg?: string;

  @Column({ nullable: true, length: 20 })
  @IsString()
  @ApiProperty({
    example: '010-3215-4946',
  })
  phoneNumber?: string;

  @Column({ nullable: true, default: 0 })
  @IsNumber()
  darkMode?: 0 | 1;

  @ManyToMany(() => ConferenceEntity, (conference) => conference.users, {
    onDelete: 'CASCADE',
  })
  conferences: ConferenceEntity[];

  @OneToMany(() => CategoryEntitiy, (category) => category.user, {
    onDelete: 'CASCADE',
  })
  categories: CategoryEntitiy[];

  // @OneToOne(() => FriendsEntity, (friends) => friends.user, {
  //   onDelete: 'CASCADE',
  // })
  // friends: FriendsEntity;

  @Column({ nullable: true, length: 3000 })
  @IsString()
  hashRT?: string;
}
