import { Module } from '@nestjs/common';
import { AgendaService } from './agenda.service';

@Module({
  providers: [AgendaService]
})
export class AgendaModule {}
