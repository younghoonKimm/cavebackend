import { ConferenceStatus } from '../entities/conference.entity';

export interface ConferenceInput {
  title: string;
  status: ConferenceStatus;
  agenda: string;
  users: string[];
}
