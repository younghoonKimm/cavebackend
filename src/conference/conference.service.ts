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
    const { users, agendas = [{ title: '22', text: '33' }] } = conference;
    try {
      const invitedUsers = await this.authService.getAllUSer(users);

      if (invitedUsers) {
        await this.conferenceInfo.save(
          this.conferenceInfo.create({
            ...conference,
            users: invitedUsers,
            agendas: agendas,
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
        .leftJoinAndSelect('user_entity.conferences', 'conferences')
        .leftJoin('conferences.users', 'users')
        .addSelect(['users.name', 'users.profileImg'])
        .where('user_entity.id = :id', {
          id,
        })

        // .leftJoinAndSelect('conferences.agendas', 'agendas.id')
        .getOne();

      return userConference;
    } catch (e) {
      console.log(e);
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
      console.log(e);
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
        const res = await this.conferenceInfo.delete({ id: conferenceId });

        console.log(res);
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
