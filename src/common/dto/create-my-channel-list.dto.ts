import { AutoMap } from '@automapper/classes';
import { ChannelListDTO } from './channelList.dto';

export class CreateMyChannelListDTO {
    @AutoMap()
    public userId: string;
    @AutoMap(() => [ChannelListDTO])
    public channelList: ChannelListDTO;

}
