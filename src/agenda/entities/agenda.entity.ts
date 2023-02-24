import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CommonEntitiy } from 'src/common/entity/common.entity';
import { IsString } from 'class-validator';
import { ConferenceEntity } from 'src/conference/entities/conference.entity';

@Entity()
export class AgendaEntity extends CommonEntitiy {
  @Column({ length: 30, default: '' })
  @IsString()
  title: string;

  @Column({ length: 30000, default: '' })
  @IsString()
  text: string;

  @ManyToOne(() => ConferenceEntity, (conference) => conference.agendas, {
    onDelete: 'CASCADE',
  })
  conference: ConferenceEntity;
}
