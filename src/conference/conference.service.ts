import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AgendaEntity } from 'src/agenda/entities/agenda.entity';

import { AuthService } from 'src/auth/auth.service';
import { UserInputDto } from 'src/user/dto/user.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
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

  async checkJoinedUser() {
    // const oldConference = await this.conferenceInfo
    // .createQueryBuilder('conference_entity')
    // .leftJoinAndSelect('conference_entity.users', 'users')
    // .leftJoinAndSelect('conference_entity.agendas', 'agendas')
    // .where('conference_entity.id = :cid AND users.id = :id', {
    //   cid,
    //   id,
    // })
    // .getOne();
  }

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
            agendas: [{ title: 'title', text: 'text' }],
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

  async getConferences({ id }: UserInputDto): Promise<UserEntity> {
    try {
      const userConference = await this.userInfo
        .createQueryBuilder('user_entity')
        .where('user_entity.id = :id', {
          id,
        })
        .leftJoinAndSelect('user_entity.conferences', 'conferences')
        // .leftJoinAndSelect('conferences.agendas', 'agendas.id')
        .getOne();

      return userConference;
    } catch (e) {
      throw new HttpException('nodata', HttpStatus.NOT_FOUND);
    }
  }

  async getConference(
    { id }: UserInputDto,
    conferenceId: string,
  ): Promise<ConferenceEntity> {
    try {
      const conference = await this.conferenceInfo
        .createQueryBuilder('conference_entity')
        .leftJoinAndSelect('conference_entity.users', 'users')
        .where('conference_entity.id = :conferenceId AND users.id = :id', {
          conferenceId,
          id,
        })
        .select([
          'conference_entity.id',
          'conference_entity.title',
          'conference_entity.status',
        ])
        .leftJoinAndSelect('conference_entity.agendas', 'agendas')
        .getOne();

      return conference;
    } catch (e) {
      throw new HttpException('nodata', HttpStatus.NOT_FOUND);
    }
  }

  async patchConference(
    user: UserInputDto,
    conferenceId: string,
  ): Promise<void> {
    // const { id } = user;
    const id = 'e9a1cf0b-952c-4b69-a58c-b8a9edd2fb57';
    const cid = '53dbdbdf-04e1-44ac-91d5-721b2c90fdc3';
    try {
      const oldConference = await this.conferenceInfo
        .createQueryBuilder('conference_entity')
        .leftJoinAndSelect('conference_entity.users', 'users')
        .leftJoinAndSelect('conference_entity.agendas', 'agendas')
        .where('conference_entity.id = :cid AND users.id = :id', {
          cid,
          id,
        })
        .getOne();

      if (oldConference) {
        this.conferenceInfo.save({ ...oldConference, title: '수정완료' });
      }
    } catch (error) {
      console.log(error);
    }
    // const conference = await this.conferenceInfo
    //   .createQueryBuilder('conference_entity')
    //   .leftJoinAndSelect('conference_entity.agendas', 'agendas')
    //   .where('conference_entity.id = :cid', {
    //     cid,
    //   })

    //   .getOne();

    // 53dbdbdf-04e1-44ac-91d5-721b2c90fdc3
  }

  async deleteConference(
    { id: userId }: UserInputDto,
    conferenceId: string,
  ): Promise<void> {
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

  async deleteConferenceUser(userId: string): Promise<void> {
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
          users: oldConferences.users.filter((user) => user.id !== userId),
        });
      }
    } catch (error) {}
  }
}
