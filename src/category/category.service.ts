import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserInputDto } from 'src/user/dto/user.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CategoryEntitiy } from './entities/category.entity';
import { ConferenceEntity } from 'src/conference/entities/conference.entity';

@Injectable()
export class CategoryService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userInfo: Repository<UserEntity>,
    @Inject('CONFERENCE_REPOSITORY')
    private conferenceInfo: Repository<ConferenceEntity>,
    @Inject('CATEGORY_REPOSITORY')
    private categoryInfo: Repository<CategoryEntitiy>,
    @Inject('DATASOURCE') private dataSource: DataSource,
  ) {}

  async getUser(id: string): Promise<UserEntity> {
    const slaveQuery = this.dataSource.createQueryRunner('slave');

    try {
      const userConference = await this.userInfo
        .createQueryBuilder('user_entity')
        .setQueryRunner(slaveQuery)
        .where('user_entity.id = :id', {
          id,
        })
        .getOne();

      return userConference;
    } catch (e) {
      console.log(e);
      throw new HttpException('nodata', HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await slaveQuery.release();
    }
  }

  async getCategories({ id }: UserInputDto): Promise<any> {
    const slaveQuery = this.dataSource.createQueryRunner('slave');

    try {
      const userConference = await this.userInfo
        .createQueryBuilder('user_entity')
        .setQueryRunner(slaveQuery)
        .where('user_entity.id = :id', {
          id,
        })
        .getOne();

      return userConference;
    } catch (e) {
      console.log(e);
      throw new HttpException('nodata', HttpStatus.NOT_FOUND);
    } finally {
      await slaveQuery.release();
    }
  }

  async getCategory(id: string): Promise<any> {
    const slaveQuery = this.dataSource.createQueryRunner('slave');

    try {
      const category = await this.categoryInfo
        .createQueryBuilder('category_entity')
        .setQueryRunner(slaveQuery)
        .where('category_entity.id = :id', {
          id,
        })
        .leftJoinAndSelect('category_entity.conferences', 'conferences')
        .getOne();

      return category;
    } catch (e) {
      console.log(e);
      throw new HttpException('nodata', HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await slaveQuery.release();
    }
  }

  async createCategory({ id }: UserInputDto): Promise<any> {
    const msQuery = this.dataSource.createQueryRunner('master');

    await msQuery.connect();
    await msQuery.startTransaction();
    try {
      const user = await this.userInfo
        .createQueryBuilder('user_entity')
        .setQueryRunner(msQuery)
        .where('user_entity.id = :id', {
          id,
        })
        .getOne();

      //   console.log(user);

      //   const conf = await this.conferenceInfo
      //     .createQueryBuilder('conference_entity')
      //     .setQueryRunner(msQuery)
      //     .where('conference_entity.id = :id', {
      //       id: '32ca7c78-0e92-4029-b224-13e0c402ba39',
      //     })
      //     .getOne();
      //   // const conf = await.conf32ca7c78-0e92-4029-b224-13e0c402ba39
      //   console.log(conf);

      if (user) {
        await this.categoryInfo.save(
          this.categoryInfo.create({
            user,
            title: '테스팅',
            order: 2,
            // conferences: [conf],
          }),
        );
      }
    } catch (e) {
    } finally {
      await msQuery.release();
    }
  }

  async deleteCategory({ id }: UserInputDto): Promise<any> {
    const slaveQuery = this.dataSource.createQueryRunner('slave');
  }

  async patchCategory(id: string): Promise<any> {
    const msQuery = this.dataSource.createQueryRunner('master');

    try {
      const category = await this.categoryInfo
        .createQueryBuilder('category_entity')
        .setQueryRunner(msQuery)
        .where('category_entity.id = :id', {
          id: '60fc95be-6094-4fbc-a8fb-cae05ee144c2',
        })
        .leftJoinAndSelect('category_entity.conferences', 'conferences')
        .getOne();

      const conf = await this.conferenceInfo
        .createQueryBuilder('conference_entity')
        .setQueryRunner(msQuery)
        .where('conference_entity.id = :id', {
          id: '32ca7c78-0e92-4029-b224-13e0c402ba39',
        })
        .getOne();
      // const conf = await.conf32ca7c78-0e92-4029-b224-13e0c402ba39
      console.log(conf, category);
      await this.categoryInfo.save({ ...category, conferences: [] });

      return category;
    } catch (e) {
      console.log(e);
      throw new HttpException('nodata', HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await msQuery.release();
    }
  }
}
