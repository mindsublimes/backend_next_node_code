import { ChannelDTO } from '@DTO/channel.dto';
import ApiResponse from '@Helper/api-response';
import { ChannelService } from '@Services/channel.service';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';

@Controller('channel')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  /**
   * @returns return all channel from mongo db
   */
  @Get('/getAll')
  public async GetAllChannels(): Promise<ApiResponse<ChannelDTO[]>> {
    let response = await this.channelService.GetAllChannels();
    return response;
  }

  @Post('/mapchannelimages')
  public async MapChannelImages(@Body() channelIds: string[]) {
    await this.channelService.MapChannelImagesPathBasedOnChannelIds(channelIds);
  }

  @Get('/seed')
  public async SeedChannels() {
    return await this.channelService.CreateChannels();
  }

  /**
   * @returns return all channel from mongo db
   */
  @Get('/getAllByRegion')
  public async GetAllChannelsByRegion(
    @Query('region') region: string,
  ): Promise<ApiResponse<ChannelDTO[]>> {
    let response = await this.channelService.GetAllChannelsByRegion(region);
    return response;
  }
}
