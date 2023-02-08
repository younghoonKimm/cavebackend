import { IsString } from 'class-validator';
import { CommonEntitiy } from 'src/common/entity/common.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';

@Entity()
export class ConferenceEntity extends CommonEntitiy {
  @Column({ length: 30 })
  @IsString()
  title: string;

  @Column({ length: 30000 })
  @IsString()
  agenda: string;

  @ManyToMany(() => UserEntity, (user) => user.conferences, { cascade: true })
  users: UserEntity[];
}
