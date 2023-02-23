import { Inject, Injectable } from '@nestjs/common';

import { UserEntity } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { AgendaEntity } from './entities/agenda.entity';

@Injectable()
export class AgendaService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userInfo: Repository<UserEntity>,
    @Inject('AGENDA_REPOSITORY')
    private agendaInfo: Repository<AgendaEntity>,

    @Inject('DATASOURCE') private dataSource: DataSource, // private readonly eventsGateway: EventsGateway,
  ) {}

  async patchAgenda(agendaId: string): Promise<void> {
    try {
      const agenda = await this.agendaInfo
        .createQueryBuilder('agenda_entity')
        .where('agenda_entity.id = :agendaId', {
          agendaId,
        })
        .getOne();

      await this.agendaInfo.save({ ...agenda, title: '수정해버렸쥬' });

      // this.eventsGateway.server
      //   .to('/ws-53dbdbdf-04e1-44ac-91d5-721b2c90fdc3')
      //   .emit('message', '수정해벌렷쮸');
    } catch (error) {
      console.log(error);
    }
  }
}
