import { DataSource } from 'typeorm';
import { FriendsEntity } from './entities/friends.entitiy';

export const friendsProviders = [
  {
    provide: 'FRIENDS_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(FriendsEntity),
    inject: ['DATASOURCE'],
  },
];
