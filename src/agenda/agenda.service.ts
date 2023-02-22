import { Inject, Injectable } from '@nestjs/common';
import { UserInputDto } from 'src/user/dto/user.dto';
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
  ) {}

  async patchAgenda(agendaId: string): Promise<void> {
    try {
      const agenda = await this.agendaInfo
        .createQueryBuilder('agenda_entity')
        .where('agenda_entity.id = :agendaId', {
          agendaId,
        })
        .getOne();

      this.agendaInfo.save({ ...agenda, title: '수정해버렸쥬' });

      console.log(agenda);
    } catch (error) {
      console.log(error);
    }
  }
}
