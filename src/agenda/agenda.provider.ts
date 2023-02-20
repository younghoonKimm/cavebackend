import { DataSource } from 'typeorm';
import { AgendaEntity } from './entities/agenda.entity';

export const agendaProviders = [
  {
    provide: 'AGENDA_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(AgendaEntity),
    inject: ['DATASOURCE'],
  },
];
