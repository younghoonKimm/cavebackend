import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { UserInputDto } from 'src/user/dto/user.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
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
  //   user: UserInputDto,
  async createConference(conference) {
    // const owner = await this.authService.getUser(user);

    const dummyData = {
      title: '테스트용',
      status: 'P',
      agenda: '김기린',
    };

    const userId = [
      '45ff23dc-de4b-4a45-9c69-964153db7119',
      '55ff23dc-de4b-4a45-9c69-964153db7119',
    ];
    const owners = await this.authService.getAllUSer(userId);

    const newConf = await this.conferenceInfo.save(
      this.conferenceInfo.create({
        ...dummyData,
        status: dummyData.status as ConferenceStatus,
        users: owners,
      }),
    );
  }

  async deleteConferenceUser() {
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

    const user = await this.userInfo.findOne({
      where: { id: '55ff23dc-de4b-4a45-9c69-964153db7119' },
      relations: ['conferences'],
    });
  }
}
