import { AutoMap } from '@automapper/classes';

export class BaseAPIResponse {
  @AutoMap()
  id: string;
  @AutoMap()
  title: string;
}
