import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from './base.repository';
import { Channel, ChannelDocument } from '@Entities/channel.entity';
import { BaseDTO } from '@DTO/base.dto';
import { Model } from 'mongoose';

@Injectable()
export class ChannelRepository extends BaseRepository<ChannelDocument> {
  constructor(
    @InjectModel(Channel.name)
    private model: Model<Channel>,
  ) {
    super(model);
  }

  /**
   * This method is fetching only channel ids
   * @returns channelIds
   */
  public async getChannelIds(): Promise<BaseDTO[]> {
    let result = await this.getAllBySpecifiedColumns({ _id: 1 });
    let response: BaseDTO[] = [];
    if (result?.length) {
      for (let res of result) {
        response.push({ id: res._id });
      }
    }
    return response;
  }
  /**
   * This method is fetching all channels in the collection
   * @returns channelIds
   */
  public async getAllChannels(): Promise<ChannelDocument[]> {
    let result = await this.getAll();
    return result;
  }

  /**
   * This method is fetching all channels in the collection
   * @returns channelIds
   */
  public async getAllChannelsByRegion(
    region: string,
  ): Promise<ChannelDocument[]> {
    let result = await this.getByFilter({ region: region });
    return result;
  }

  /**
   * This method is fetching all channels in the collection
   * @returns channel[]
   */
  public async getAllChannelIdsByPlatform(
    platformId: string,
  ): Promise<ChannelDocument[]> {
    let result = await this.getByFilter(
      { 'platforms.platformId': platformId },
      { _id: 0, Id: 1 },
    );
    return result;
  }
}
