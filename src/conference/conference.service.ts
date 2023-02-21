import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AgendaEntity } from 'src/agenda/entities/agenda.entity';

import { AuthService } from 'src/auth/auth.service';
import { UserInputDto } from 'src/user/dto/user.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { DataSource, getRepository, Repository } from 'typeorm';
import { ConferenceInput } from './dto/conference.dto';
import { ConferenceEntity } from './entities/conference.entity';

@Injectable()
export class ConferenceService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userInfo: Repository<UserEntity>,
    @Inject('CONFERENCE_REPOSITORY')
    private conferenceInfo: Repository<ConferenceEntity>,

    @Inject('AGENDA_REPOSITORY')
    private agendaInfo: Repository<AgendaEntity>,
    private readonly authService: AuthService,

    @Inject('DATASOURCE') private dataSource: DataSource,
  ) {}

  async createConference(conference: ConferenceInput): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const invitedUsers = await this.authService.getAllUSer(conference.users);
      if (invitedUsers) {
        await this.conferenceInfo.save(
          this.conferenceInfo.create({
            ...conference,
            status: conference.status,
            users: invitedUsers,
          }),
        );
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.errorMessage, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async getConferences(user: UserInputDto) {
    const { id } = user;
    try {
      const userConference = await this.userInfo
        .createQueryBuilder('user_entity')
        .where('user_entity.id = :id', {
          id,
        })
        .leftJoinAndSelect('user_entity.conferences', 'conferences')
        .leftJoinAndSelect('conferences.agendas', 'agendas.id')
        .getOne();

      return userConference;
    } catch (e) {
      throw new HttpException('nodata', HttpStatus.NOT_FOUND);
    }
  }

  async getConference(id: string) {
    try {
      const conference = await this.conferenceInfo
        .createQueryBuilder('conference_entity')
        .where('conference_entity.id = :id', {
          id,
        })
        .leftJoinAndSelect('conference_entity.agendas', 'agendas')
        .select([
          'conference_entity.id',
          'conference_entity.title',
          'conference_entity.status',
        ])
        .getOne();
      console.log(conference);
      return conference;
    } catch (e) {
      throw new HttpException('nodata', HttpStatus.NOT_FOUND);
    }
  }

  async deleteConference({ id: userId }: UserInputDto, conferenceId: string) {
    try {
      const oldConference = await this.conferenceInfo.findOne({
        where: {
          id: conferenceId,
          users: {
            id: userId,
          },
        },

        relations: ['users'],
      });
      if (oldConference) {
        await this.conferenceInfo.delete({ id: conferenceId });
      }
    } catch (error) {}
  }

  async deleteConferenceUser(userId: string) {
    try {
      const oldConferences = await this.conferenceInfo.findOne({
        where: {
          id: userId,
        },
        relations: ['users'],
      });

      if (oldConferences) {
        await this.conferenceInfo.save({
          ...oldConferences,
          users: oldConferences.users.filter(
            (user) => user.id !== '45ff23dc-de4b-4a45-9c69-964153db7119',
          ),
        });
      }
    } catch (error) {}

    // const user = await this.userInfo.findOne({
    //   where: { id: '55ff23dc-de4b-4a45-9c69-964153db7119' },
    //   relations: ['conferences'],
    // });
  }
}
