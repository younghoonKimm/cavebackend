import { Controller, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/auth.guard';
import { ConferenceService } from './conference.service';

@Controller('api/conference')
export class ConferenceController {
  constructor(private conferenceService: ConferenceService) {}

  @Post('/create')
  @UseGuards(AccessTokenGuard)
  async createConference() {}
}
