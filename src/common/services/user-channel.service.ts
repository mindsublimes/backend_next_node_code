import ApiResponse from '@Helper/api-response';
import ResponseHelper from '@Helper/response-helper';
import { UserChannelRepository } from '@Repository/user-channel.repository';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateMyChannelListDTO } from '@DTO/create-my-channel-list.dto';
import { MyChannel, MyChannelDocument } from '@Entities/my-channels.entity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Mapper as MapperToCreate } from '@automapper/types';

/**
 * This service is responsible for handling channel document and its related operations.
 */
@Injectable()
export class UserChannelService {
  /**
   * This is constructor which is used to initialize the channel repository..
   */
  constructor(
    @InjectMapper() private readonly mapperToCreateEntity: MapperToCreate,
    private readonly userChannelRepository: UserChannelRepository,
  ) {}

  /**
   * saves my channels list in to the collection
   * @returns ApiResponse<ChannelDto[]>
   */
  public async CreateUserChannels(
    userChannelPayload: CreateMyChannelListDTO,
  ): Promise<ApiResponse<boolean>> {
    let channelList = this.mapperToCreateEntity.map(
      userChannelPayload,
      MyChannel,
      CreateMyChannelListDTO,
    );
    const result = await this.userChannelRepository.createUserChannels(
      channelList,
    );
    if (result) {
      return ResponseHelper.CreateResponse<boolean>(true, HttpStatus.CREATED);
    } else {
      return ResponseHelper.CreateResponse<boolean>(
        false,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * updates user channels
   * @returns ApiResponse<string>
   */
  public async UpdateUserChannel(
    userId: string,
    userChannelPayload: CreateMyChannelListDTO,
  ): Promise<ApiResponse<string>> {
    let channelList = this.mapperToCreateEntity.map(
      userChannelPayload,
      MyChannel,
      CreateMyChannelListDTO,
    );
    const result = await this.userChannelRepository.updateUserChannel(
      userId,
      channelList,
    );
    if (result) {
      return ResponseHelper.CreateResponse<string>(result, HttpStatus.CREATED);
    } else {
      return ResponseHelper.CreateResponse<string>(
        'requested user channels are not updated',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * updates user channels on delete of my selected channel lists.
   * @returns ApiResponse<string>
   */
  public async ReplaceUserChannel(
    userId: string,
    userChannelPayload: CreateMyChannelListDTO,
  ): Promise<ApiResponse<string>> {
    let channelList = this.mapperToCreateEntity.map(
      userChannelPayload,
      MyChannel,
      CreateMyChannelListDTO,
    );
    const result = await this.userChannelRepository.replaceUserChannel(
      userId,
      channelList,
    );
    if (result) {
      return ResponseHelper.CreateResponse<string>(result, HttpStatus.CREATED);
    } else {
      return ResponseHelper.CreateResponse<string>(
        'requested user channels are not updated',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Fetch All channels from the collections based on region
   * @returns ApiResponse<ChannelDto>
   */
  public async GetAllUserChannels(
    userId: string,
  ): Promise<ApiResponse<MyChannelDocument>> {
    const result = await this.userChannelRepository.getAllUserChannels(userId);
    return ResponseHelper.CreateResponse<MyChannelDocument>(
      result,
      HttpStatus.OK,
    );
  }

  /**
   * deletes user channel
   * @returns ApiResponse<string>
   */
  public async DeleteUserChannel(
    userId: string,
    channelDetails: [],
  ): Promise<ApiResponse<string>> {
    const result = await this.userChannelRepository.deleteUserChannel(
      userId,
      channelDetails,
    );
    if (result) {
      return ResponseHelper.CreateResponse<string>(result, HttpStatus.CREATED);
    } else {
      return ResponseHelper.CreateResponse<string>(
        'requested user channel is not deleted',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
