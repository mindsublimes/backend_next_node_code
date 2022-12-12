import { AutoMap } from '@automapper/classes';

export class ChannelListDTO {
    @AutoMap()
    public channelId: string;
    @AutoMap()
    public channelTitle: string;
    @AutoMap()
    public channelLogo: string;
}
