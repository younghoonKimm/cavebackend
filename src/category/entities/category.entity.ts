import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
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

  @ManyToMany(() => ConferenceEntity, { cascade: true })
  @JoinTable({
    name: 'ConferenceCat',
    joinColumn: {
      name: 'ConfrenceId',
      referencedColumnName: 'id',
    },
  })
  conferences: ConferenceEntity[];

  @ManyToOne(() => UserEntity, (user) => user.categories, {})
  user: UserEntity;
}
