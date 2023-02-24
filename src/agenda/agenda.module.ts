import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'src/databse/database.module';
import { EventsGateway } from 'src/events/events.gateway';
import { EventsModule } from 'src/events/events.module';

import { UserEntity } from 'src/user/entities/user.entity';
import { userProviders } from 'src/user/user.providers';
import { AgendaController } from './agenda.controller';
import { agendaProviders } from './agenda.provider';
import { AgendaService } from './agenda.service';
import { AgendaEntity } from './entities/agenda.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AgendaEntity]),
    DatabaseModule,
    EventsModule,
  ],
  providers: [
    AgendaService,
    JwtService,
    ...userProviders,
    ...agendaProviders,
    EventsGateway,
  ],
  controllers: [AgendaController],
})
export class AgendaModule {}
