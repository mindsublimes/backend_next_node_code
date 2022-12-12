import { AutoMap } from '@automapper/classes';

export class RegionResponseDto {
    @AutoMap()
    public regionId: string;
    @AutoMap()
    public regionName: string;
}

