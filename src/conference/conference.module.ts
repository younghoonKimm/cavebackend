import { Module } from '@nestjs/common';
import { ConferenceService } from './conference.service';

@Module({
  providers: [ConferenceService]
})
export class ConferenceModule {}
