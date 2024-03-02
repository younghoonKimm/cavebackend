import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString } from 'class-validator';
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
  @ApiProperty({
    example: 'title',
  })
  title: string;

  @Column({ default: 'R' })
  @ApiProperty({
    example: 'P | R | S',
  })
  @IsString()
  status: ConferenceStatus;

  @Column()
  @IsString()
  @ApiProperty({
    example: '2024',
  })
  @IsString()
  date: Date;

  @Column({ length: 40, default: 'ds' })
  @ApiProperty({
    example: 'location',
  })
  @IsString()
  location?: String;

  @Column({ default: '60' })
  @IsString()
  @ApiProperty({
    example: '60',
  })
  settingTime: string;

  @Column({ default: '60' })
  @IsString()
  @ApiProperty({
    example: '60',
  })
  remainTime: string;

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
