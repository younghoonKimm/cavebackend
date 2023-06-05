import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATASOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        replication: {
          master: {
            host: process.env.PGPOOL_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
          },
          slaves: [
            {
              host: process.env.DB_HOST,
              port: +process.env.DB_PORT,
              username: process.env.DB_USERNAME,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_NAME,
            },
            // {
            //   username: process.env.DB_USERNAME,
            //   host: process.env.DB_SLAVE_HOST,
            //   port: +process.env.DB_SLAVE_PORT,
            //   password: process.env.DB_PASSWORD,
            //   database: process.env.DB_SLAVE_NAME,
            // },
          ],
        },

        // replication: {
        //   master: {
        //     username: process.env.DB_USERNAME,
        //     host: process.env.DB_HOST,
        //     port: +process.env.DB_PORT,
        //     // username: process.env.DB_USERNAME,
        //     // database: process.env.DB_NAME,
        //     password: process.env.DB_PASSWORD,
        //   },
        //   slaves: [
        //     // {
        //     //   username: process.env.DB_USERNAME,
        //     //   host: process.env.DB_SLAVE_HOST,
        //     //   port: +process.env.DB_SLAVE_PORT,
        //     //   // database: process.env.DB_SLAVE_NAME,
        //     //   // username: process.env.DB_USERNAME,
        //     //   password: process.env.DB_PASSWORD,
        //     //   database: process.env.DB_SLAVE_NAME,
        //     // },
        //   ],
        // },

        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
      });

      return await dataSource.initialize();
    },
  },
];
