import { AgendaEntity } from 'src/agenda/entities/agenda.entity';
import { ConferenceStatus } from '../entities/conference.entity';

export interface ConferenceInput {
  title: string;
  status: ConferenceStatus;
  agendas: AgendaEntity[];
  users: string[];
}
