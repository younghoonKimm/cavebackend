import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { UserInputDto } from 'src/user/dto/user.dto';
import { UserEntity } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CategoryEntitiy } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userInfo: Repository<UserEntity>,
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
      throw new HttpException('nodata', HttpStatus.NOT_FOUND);
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

      if (user) {
        await this.categoryInfo.save(
          this.categoryInfo.create({
            user,
            title: 'dsds',
            order: 1,
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

  async orderCategory({ id }: UserInputDto): Promise<any> {
    const slaveQuery = this.dataSource.createQueryRunner('slave');
  }
}
