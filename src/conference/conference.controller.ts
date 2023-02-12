import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/auth.guard';
import { Token } from 'src/auth/decorator/auth.decorator';
import { UserInputDto } from 'src/user/dto/user.dto';
import { ConferenceService } from './conference.service';

@Controller('api/conference')
export class ConferenceController {
  constructor(private conferenceService: ConferenceService) {}

  @Post('/create')
  @UseGuards(AccessTokenGuard)
  async createConference(@Body() conferenceInfo: any) {
    return await this.conferenceService.createConference(conferenceInfo);
  }

  @Get('/')
  @UseGuards(AccessTokenGuard)
  async getConference(@Token() user: UserInputDto) {
    return await this.conferenceService.getConference(user);
  }

  @Delete('/:id')
  @UseGuards(AccessTokenGuard)
  async deleteConference(
    @Token() user: UserInputDto,
    @Param() { id: conferenceId },
  ) {
    return await this.conferenceService.deleteConference(user, conferenceId);
  }

  @Delete('/delete/user')
  @UseGuards(AccessTokenGuard)
  async deleteConferenceUser(@Body() { userId }: { userId: string }) {
    await this.conferenceService.deleteConferenceUser(userId);
  }
}
