import { AutoMap } from '@automapper/classes';

export class UserDTO {
  @AutoMap()
  id: string;
  @AutoMap()
  email: string;
  @AutoMap()
  region: string;
}
