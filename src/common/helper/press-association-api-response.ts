import { HttpStatus } from '@nestjs/common';
import Feedback from './feedback';

export default class PressAssociationAPIResponse<T> {
  public hasNext: boolean;
  public total: number;
  public item: T[];
}
