import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/auth.guard';
import { Token } from 'src/auth/decorator/auth.decorator';
import { UserInputDto } from 'src/user/dto/user.dto';
import { ConferenceService } from './conference.service';

@Controller('api/conference')
export class ConferenceController {
  constructor(private conferenceService: ConferenceService) {}

  @Post('/create')
  //   @UseGuards(AccessTokenGuard)
  async createConference(
    // @Token() user: UserInputDto,
    @Body() conferenceInfo: any,
  ) {
    await this.conferenceService.createConference(conferenceInfo);
    // console.log(user);
    // console.log(conferenceInfo);
  }

  @Post('/delete/user')
  //   @UseGuards(AccessTokenGuard)
  async deleteConferenceUser(
    // @Token() user: UserInputDto,
    @Body() conferenceInfo: any,
  ) {
    await this.conferenceService.deleteConferenceUser();
    // console.log(user);
    // console.log(conferenceInfo);
  }
}
