import { Inject, Injectable } from '@nestjs/common';
import { EventsGateway } from 'src/events/events.gateway';

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

    @Inject('DATASOURCE') private dataSource: DataSource,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async patchAgenda(agendaId: string): Promise<void> {
    try {
      const agenda = await this.agendaInfo
        .createQueryBuilder('agenda_entity')
        .where('agenda_entity.id = :agendaId', {
          agendaId,
        })
        .getOne();

      await this.agendaInfo.save({
        ...agenda,
        title: '수정해버렸쥬',
      });

      this.eventsGateway.server
        .to(`/ws-be2d1cd2-9c36-4236-8de5-93fd4e3df3bb`)
        .emit('messaged', '왜안됨?');
    } catch (error) {
      console.log(error);
    }
  }
}
