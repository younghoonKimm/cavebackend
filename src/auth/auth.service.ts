import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor() {}
  async authLogin(data: any) {
    return { status: true, token: 'sdds' };
  }
}
