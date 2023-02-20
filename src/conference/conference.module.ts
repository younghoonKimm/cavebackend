import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { agendaProviders } from 'src/agenda/agenda.provider';
import { AgendaEntity } from 'src/agenda/entities/agenda.entity';
import { AuthService } from 'src/auth/auth.service';
import { DatabaseModule } from 'src/databse/database.module';
import { UserEntity } from 'src/user/entities/user.entity';
import { userProviders } from 'src/user/user.providers';

import { ConferenceController } from './conference.controller';
import { conferenceProviders } from './conference.provider';
import { ConferenceService } from './conference.service';
import { ConferenceEntity } from './entities/conference.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ConferenceEntity, AgendaEntity]),
    DatabaseModule,
  ],
  providers: [
    ConferenceService,
    JwtService,
    AuthService,
    ...conferenceProviders,
    ...userProviders,
    ...agendaProviders,
  ],
  controllers: [ConferenceController],
  exports: [ConferenceModule],
})
export class ConferenceModule {
  constructor() {}
}
