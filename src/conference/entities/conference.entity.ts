import { IsString } from 'class-validator';
import { AgendaEntity } from 'src/agenda/entities/agenda.entity';
import { CommonEntitiy } from 'src/common/entity/common.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';

export enum ConferenceStatus {
  Reserve = 'R',
  Proceed = 'P',
  Done = 'D',
}

@Entity()
export class ConferenceEntity extends CommonEntitiy {
  @Column({ length: 30 })
  @IsString()
  title: string;

  @Column({ default: 'R' })
  @IsString()
  status: ConferenceStatus;

  @ManyToMany(() => UserEntity, (user) => user.conferences, { cascade: true })
  @JoinTable({
    name: 'Conference',
    joinColumn: {
      name: 'ConfrenceId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'UserId',
      referencedColumnName: 'id',
    },
  })
  users: UserEntity[];

  @OneToMany(() => AgendaEntity, (agenda) => agenda.conference, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  agendas: AgendaEntity[];
}
