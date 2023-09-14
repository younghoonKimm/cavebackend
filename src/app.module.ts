import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserEntity } from './user/entities/user.entity';
import { EventsModule } from './events/events.module';
import { ConferenceModule } from './conference/conference.module';
import { ConferenceEntity } from './conference/entities/conference.entity';
import { AgendaModule } from './agenda/agenda.module';
import { AgendaEntity } from './agenda/entities/agenda.entity';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { CategoryEntitiy } from './category/entities/category.entity';
import { CategoryModule } from './category/category.module';
// import { FreindsModule } from './freinds/freinds.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
 
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod'),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        ACCESS_TOKEN_EXPIRATION: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_EXPIRATION: Joi.string().required(),
        OAUTH_GOOGLE_ID: Joi.string().required(),
        OAUTH_GOOGLE_SECRET: Joi.string().required(),
        OAUTH_GOOGLE_REDIRECT: Joi.string().required(),
      }),
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        type: 'postgres',
        host: process.env.PGPOOL_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false },
        replication: {
          master: {
            host: process.env.DB_HOST,
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
            {
              username: process.env.DB_USERNAME,
              host: process.env.DB_SLAVE_HOST,
              port: +process.env.DB_SLAVE_PORT,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_SLAVE_NAME,
            },
          ],
        },
        entities: [UserEntity, ConferenceEntity, AgendaEntity, CategoryEntitiy],
        synchronize: true,
        logging: true,
      }),
    }),
    AuthModule,
    ConferenceModule,
    AgendaModule,
    CategoryModule,
    EventsModule,
    // FreindsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
