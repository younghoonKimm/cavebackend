import { DataSource } from 'typeorm';
import { CategoryEntitiy } from './entities/category.entity';

export const categoryProviders = [
  {
    provide: 'CATEGORY_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(CategoryEntitiy),
    inject: ['DATASOURCE'],
  },
];
