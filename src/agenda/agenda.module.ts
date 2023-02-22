import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'src/databse/database.module';
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
  ],
  providers: [AgendaService, ...userProviders, ...agendaProviders],
  controllers: [AgendaController],
  exports: [AgendaModule],
})
export class AgendaModule {}
