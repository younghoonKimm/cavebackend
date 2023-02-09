import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { IsString, IsEnum, Length, IsNumber } from 'class-validator';
import { CommonEntitiy } from 'src/common/entity/common.entity';
import { ConferenceEntity } from 'src/conference/entities/conference.entitiy';

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
  @JoinTable({
    name: 'conference',
    joinColumn: {
      name: 'UserId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'ConfrenceId',
      referencedColumnName: 'id',
    },
  })
  conferences: ConferenceEntity[];

  @Column({ nullable: true, length: 1000 })
  @IsString()
  hashRT?: string;
}
