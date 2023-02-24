import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/auth.guard';
import { Token } from 'src/auth/decorator/auth.decorator';
import { UserInputDto } from 'src/user/dto/user.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { ConferenceService } from './conference.service';
import { ConferenceInput } from './dto/conference.dto';

import { ConferenceEntity } from './entities/conference.entity';

@Controller('api/conference')
export class ConferenceController {
  constructor(private conferenceService: ConferenceService) {}

  @Post('/create')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async createConference(
    @Body() conferenceInfo: ConferenceInput,
  ): Promise<void> {
    return await this.conferenceService.createConference(conferenceInfo);
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async getConferences(@Token() user: UserInputDto): Promise<UserEntity> {
    return await this.conferenceService.getConferences(user);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async getConference(
    @Token() user: UserInputDto,
    @Param() { id: conferenceId },
  ): Promise<ConferenceEntity> {
    return await this.conferenceService.getConference(user, conferenceId);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async patchConference(
    @Token() user: UserInputDto,
    @Param() { id: conferenceId },
    @Body() data: any,
  ): Promise<void> {
    return await this.conferenceService.patchConference(
      { id: 'dsd' },
      conferenceId,
    );
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  async deleteConference(
    @Token() user: UserInputDto,
    @Param() { id: conferenceId },
  ): Promise<void> {
    return await this.conferenceService.deleteConference(user, conferenceId);
  }

  @Delete('/delete/user')
  @UseGuards(AccessTokenGuard)
  async deleteConferenceUser(
    @Body() { userId }: { userId: string },
  ): Promise<void> {
    return await this.conferenceService.deleteConferenceUser(userId);
  }
}
