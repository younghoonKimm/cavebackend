import { Inject, Injectable } from '@nestjs/common';
import { ConferenceEntity } from 'src/conference/entities/conference.entity';
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
    @Inject('CONFERENCE_REPOSITORY')
    private conferenceInfo: Repository<ConferenceEntity>,

    @Inject('DATASOURCE') private dataSource: DataSource,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async patchAgenda(agendaId: string): Promise<void> {
    try {
      const agenda = await this.agendaInfo
        .createQueryBuilder('agenda_entity')
        .leftJoinAndSelect('agenda_entity.conference', 'conference')
        // .leftJoinAndSelect('conference.users', 'users')
        .where('agenda_entity.id = :agendaId', {
          agendaId,
        })
        .getOne();

      if (agenda) {
        await this.agendaInfo.save({
          ...agenda,
          title: '꿀잼쓰!',
        });

        const conference = await this.conferenceInfo.findOne({
          where: { id: agenda.conference.id },
          relations: ['agendas'],
          select: ['id', 'agendas'],
        });

        this.eventsGateway.server
          .to(`/ws-${conference.id}`)
          .emit('messaged', conference.agendas);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
