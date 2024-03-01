import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATASOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        logging: true,
        replication: {
          master: {
            host: process.env.PGPOOL_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
          },

          slaves: [
            {
              username: process.env.DB_USERNAME,
              host: process.env.DB_SLAVE_HOST,
              port: +process.env.DB_SLAVE_PORT,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_SLAVE_NAME,
            },
          ],
        },

        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
      });

      return await dataSource.initialize();
    },
  },
];
