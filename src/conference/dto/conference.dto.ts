import { ConferenceStatus } from '../entities/conference.entitiy';

export interface ConferenceInput {
  title: string;
  status: ConferenceStatus;
  agenda: string;
  users: string[];
}
