import { Column, Entity, ManyToOne } from 'typeorm';
import { CommonEntitiy } from 'src/common/entity/common.entity';
import { IsNumber, IsString } from 'class-validator';
import { UserEntity } from 'src/user/entities/user.entity';
import { ConferenceEntity } from 'src/conference/entities/conference.entity';

@Entity()
export class CategoryEntitiy extends CommonEntitiy {
  @Column({ length: 30, default: '' })
  @IsString()
  title: string;

  @Column({})
  @IsNumber()
  order: number;

  @ManyToOne(() => ConferenceEntity)
  conferences: ConferenceEntity[];

  @ManyToOne(() => UserEntity, (user) => user.categories, {})
  user: UserEntity;
}
