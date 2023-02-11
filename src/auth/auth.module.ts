import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './GoogleStrategy';
import { userProviders } from 'src/user/user.providers';
import { DatabaseModule } from 'src/databse/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService, GoogleStrategy, ...userProviders],
  exports: [AuthModule],
})
export class AuthModule {}
