import { Column, Entity } from 'typeorm';
import { IsString } from 'class-validator';

import { CommonEntitiy } from 'src/common/entity/common.entity';

export enum FreindsAcceptStatus {
  Accept = 'accpet',
  Reject = 'reject',
  Wait = 'wait',
}

@Entity()
export class FriendsEntity extends CommonEntitiy {
  @Column()
  @IsString()
  user1: String;

  @Column()
  @IsString()
  user2: String;

  @Column()
  @IsString()
  status: FreindsAcceptStatus;
}
