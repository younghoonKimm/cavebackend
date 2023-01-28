import { HttpStatus } from '@nestjs/common';
import { Entity } from 'typeorm';

@Entity()
export class CommonOutput {
  errorText?: string;
}
