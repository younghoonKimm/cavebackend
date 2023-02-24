import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './GoogleStrategy';
import { userProviders } from 'src/user/user.providers';
import { DatabaseModule } from 'src/databse/database.module';
import { UserEntity } from 'src/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService, GoogleStrategy, ...userProviders],
})
export class AuthModule {}
