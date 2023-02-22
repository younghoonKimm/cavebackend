import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { AgendaService } from './agenda.service';

@Controller('api/agenda')
export class AgendaController {
  constructor(private agendaeService: AgendaService) {}

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AccessTokenGuard)
  async patchConference(
    @Param() { id: agendaID },
    @Body() data: any,
  ): Promise<void> {
    return await this.agendaeService.patchAgenda(agendaID);
  }
}
