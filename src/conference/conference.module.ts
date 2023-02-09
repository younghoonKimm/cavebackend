import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { ConferenceController } from './conference.controller';
import { ConferenceService } from './conference.service';
import { ConferenceEntity } from './entities/conference.entitiy';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ConferenceEntity])],
  providers: [ConferenceService, JwtService, AuthService],
  controllers: [ConferenceController],
  exports: [ConferenceModule],
})
export class ConferenceModule {
  constructor() {}
}
