import { AgendaEntity } from 'src/agenda/entities/agenda.entity';
import {
  ConferenceEntity,
  ConferenceStatus,
} from '../entities/conference.entity';

export interface ConferenceInput {
  title: string;
  status: ConferenceStatus;
  agendas: Partial<AgendaEntity>[];
  users: string[];
}

export type ConferencesOutput = ConferenceEntity[];
