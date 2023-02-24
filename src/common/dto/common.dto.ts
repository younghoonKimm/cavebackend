import { HttpStatus } from '@nestjs/common';
import { Entity } from 'typeorm';

export class CommonOutput {
  error?: Error;
  errorText?: string;
}
