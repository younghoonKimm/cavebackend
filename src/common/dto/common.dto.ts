import { HttpStatus } from '@nestjs/common';
import { Entity } from 'typeorm';

@Entity()
export class CommonOutput {
  status: HttpStatus;
  error?: string;
}
