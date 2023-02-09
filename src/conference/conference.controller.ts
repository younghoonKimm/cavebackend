import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/auth.guard';
import { Token } from 'src/auth/decorator/auth.decorator';
import { UserInputDto } from 'src/user/dto/user.dto';
import { ConferenceService } from './conference.service';
import { ConferenceInput } from './dto/conference.dto';

@Controller('api/conference')
export class ConferenceController {
  constructor(private conferenceService: ConferenceService) {}

  @Post('/create')
  @UseGuards(AccessTokenGuard)
  async createConference(
    @Token() user: UserInputDto,
    @Body() conferenceInfo: any,
  ) {
    return await this.conferenceService.createConference(user, conferenceInfo);
  }

  @Get('/')
  @UseGuards(AccessTokenGuard)
  async getConference(@Token() user: UserInputDto) {
    await this.conferenceService.getConference(user);
  }

  @Delete('/delete/user')
  @UseGuards(AccessTokenGuard)
  async deleteConferenceUser(
    @Token() user: UserInputDto,
    @Body() conferenceId: string,
  ) {
    await this.conferenceService.deleteConferenceUser(user, conferenceId);
  }
}
