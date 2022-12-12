import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { MyChannel, MyChannelDocument } from '@Entities/my-channels.entity';
import { BaseDTO } from '@DTO/base.dto';
@Injectable()
export class UserChannelRepository extends BaseRepository<MyChannelDocument> {
    constructor(
        @InjectModel(MyChannel.name)
        private model: Model<MyChannel>,

    ) {
        super(model);
    }

    /**
    * This method creates channels in my channel collection
    * @returns channelIds
    */
    public async createUserChannels(query: any): Promise<BaseDTO> {
        let result = await this.create(query);
        return result;
    }

    /**
    * This method updates user channels based on user id and channel list array
    * @returns channelIds
    */
    public async updateUserChannel(userId: string, channelDetails: MyChannelDocument): Promise<string> {
        let result = await this.findByFilterAndModify({ userId: userId }, channelDetails)
        return result;
    }

    /**
     * This method replaces channels on on delete functionality is called from front end.
     * @returns channelIds
     */
    public async replaceUserChannel(userId: string, channelDetails: MyChannelDocument): Promise<string> {
        let result = await this.replaceOne({ userId: userId }, channelDetails)
        return result;
    }

    /**
    * This method deletes specific channel
    * @returns channelIds
    */
    public async deleteUserChannel(userId: string, channelDetails: any): Promise<string> {
        let result = await this.findByFilterAndDeleteInArray({ userId: userId }, channelDetails)
        return result;
    }

    /**
   * This method is fetching all channels in the collection
   * @returns channelIds
   */
    public async getAllUserChannels(userId: string): Promise<MyChannelDocument> {
        let result = await this.getOneByFilter({ userId: userId });
        return result
    }

}
