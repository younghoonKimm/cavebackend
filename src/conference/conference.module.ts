import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { DatabaseModule } from 'src/databse/database.module';
import { UserEntity } from 'src/user/entities/user.entity';
import { userProviders } from 'src/user/user.providers';
import { DataSource } from 'typeorm';
import { ConferenceController } from './conference.controller';
import { conferenceProviders } from './conference.provider';
import { ConferenceService } from './conference.service';
import { ConferenceEntity } from './entities/conference.entity';

@Module({
  imports: [DatabaseModule],
  providers: [
    ConferenceService,
    JwtService,
    AuthService,
    ...conferenceProviders,
    ...userProviders,
  ],
  controllers: [ConferenceController],
  exports: [ConferenceModule],
})
export class ConferenceModule {
  constructor() {}
}
