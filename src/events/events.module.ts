import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [EventsGateway, JwtService],
})
export class EventsModule {}
