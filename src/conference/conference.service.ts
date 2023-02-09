import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { UserInputDto } from 'src/user/dto/user.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { ConferenceInput } from './dto/conference.dto';
import {
  ConferenceEntity,
  ConferenceStatus,
} from './entities/conference.entitiy';

@Injectable()
export class ConferenceService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userInfo: Repository<UserEntity>,
    @InjectRepository(ConferenceEntity)
    private readonly conferenceInfo: Repository<ConferenceEntity>,
    private readonly authService: AuthService,
  ) {}

  async createConference(user: UserInputDto, conference: ConferenceInput) {
    const invitedUsers = await this.authService.getAllUSer(conference.users);

    await this.conferenceInfo.save(
      this.conferenceInfo.create({
        ...conference,
        status: conference.status,
        users: invitedUsers,
      }),
    );

    //   await queryRunner.commitTransaction();
    // } catch (error) {
    //   await queryRunner.rollbackTransaction();
    //   throw new HttpException(error.errorMessage, error.status);
    // } finally {
    //   await queryRunner.release();
    // }
  }

  async getConference(user: UserInputDto) {
    const { id, email } = user;
    const userConferences = await this.userInfo
      .createQueryBuilder('user_entity')
      .where('user_entity.id = :id AND user_entity.email = :email', {
        id,
        email,
      })
      .select(['user_entity.conferences'])
      .getOne();

    return userConferences;
  }
  async deleteConferenceUser(user, conferenceId) {
    const newConf = await this.conferenceInfo.findOne({
      where: {
        id: 'd1be08d6-1ef3-406f-ad88-40d55b0d1e2d',
      },
      relations: ['users'],
    });

    await this.conferenceInfo.save({
      ...newConf,
      users: newConf.users.filter(
        (user) => user.id !== '45ff23dc-de4b-4a45-9c69-964153db7119',
      ),
    });

    // const user = await this.userInfo.findOne({
    //   where: { id: '55ff23dc-de4b-4a45-9c69-964153db7119' },
    //   relations: ['conferences'],
    // });
  }
}
