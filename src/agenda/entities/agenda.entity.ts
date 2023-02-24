import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
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

  @OneToMany(() => ConferenceEntity, (conference) => conference.agendas, {})
  // @JoinTable({
  //   name: 'conferences',
  //   joinColumn: {
  //     name: 'ConfrenceId',
  //     referencedColumnName: 'id',
  //   },
  //   inverseJoinColumn: {
  //     name: 'UserId',
  //     referencedColumnName: 'id',
  //   },
  // })
  conference: ConferenceEntity;
}
