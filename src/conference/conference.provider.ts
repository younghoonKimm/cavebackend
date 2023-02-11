import { DataSource } from 'typeorm';
import { ConferenceEntity } from './entities/conference.entity';

export const conferenceProviders = [
  {
    provide: 'CONFERENCE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ConferenceEntity),
    inject: ['DATASOURCE'],
  },
];
