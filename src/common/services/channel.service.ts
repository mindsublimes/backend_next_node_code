import ApiResponse from '@Helper/api-response';
import ResponseHelper from '@Helper/response-helper';
import { ChannelRepository } from '@Repository/channel.repository';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Channel } from '@Entities/channel.entity';
import { ChannelResponseDTO } from '@DTO/channel-response.dto';
import { Mapper } from '@automapper/core';
import { Mapper as MapperToCreate } from '@automapper/types';
import { InjectMapper } from '@automapper/nestjs';
import PlatformService from './platform.service';
import { GlobalConfigurationService } from './global-configuration.service';
import AxiosHelper from '@Helper/axios.helper';
import { BaseDTO } from '@DTO/base.dto';
import { ChannelDTO } from '@DTO/channel.dto';
import { PlatformDTO } from '@DTO/platform.dto';
import PressAssociationAPIResponse from '@Helper/press-association-api-response';
import { RegionDTO } from '@DTO/region.dto';
import { CommonFunctions } from '../utils/common-functions';

/**
 * This service is responsible for handling channel document and its related operations.
 */
@Injectable()
export class ChannelService {
  /**
   * This is constructor which is used to initialize the channel repository..
   */
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    @InjectMapper() private readonly mapperToCreateEntity: MapperToCreate,
    private channelRepository: ChannelRepository,
    private platformService: PlatformService,
    private globalConfigurationService: GlobalConfigurationService,
    private axios: AxiosHelper,
  ) {}

  /**
   * Fetch All channels from its collection
   * @returns ApiResponse<ChannelResponseDTO[]>
   */
  public async GetAllChannelsWithSpecificColumns(): Promise<
    ApiResponse<ChannelResponseDTO[]>
  > {
    const result = await this.channelRepository.getAllBySpecifiedColumns({
      _id: 1,
      logo: 1,
      channelTitle: 1,
    });
    const channels = this.mapper.mapArray(result, Channel, ChannelResponseDTO);
    return ResponseHelper.CreateResponse<ChannelResponseDTO[]>(
      channels,
      HttpStatus.OK,
    );
  }

  /**
   * @params channelIds[] it is an array of string which will contains the channelIds..
   * @returns ApiResponse<BaseDTO[]>
   */
  public async MapChannelImagesPathBasedOnChannelIds(
    channelIds: string[],
  ): Promise<ApiResponse<BaseDTO[]>> {
    let result = null;
    let response: BaseDTO[] = [];
    for (let channelId of channelIds) {
      // TODO: Ahmed Need to get from environment variables
      result = await this.channelRepository.updateProperty(channelId, {
        logo: '',
        // logo: `${Constants.S3_BUCKET_BASE_URL}${channelId}.webp`,
      });
      response.push({ id: result });
    }
    return ResponseHelper.CreateResponse<BaseDTO[]>(response, HttpStatus.OK);
  }

  /**
   * This method will fetch data from Press association media API and map channel's platform and regions accordingly into
   * our mongoDB collection.
   * @returns newly inserted channel's mongoDB ids
   */

  public async CreateChannels() {
    const platforms = await this.platformService.GetAllPlatforms();
    const mappedChannels = await this.mapChannelsBasedOnPlatformsAndRegion(
      platforms.data,
    );
    const channels = this.mapperToCreateEntity.mapArray(
      mappedChannels.data,
      Channel,
      ChannelDTO,
    );
    //Getting GlobalConfiguration To Check whether platform is going to create first time or not.
    const globalConfig = await this.globalConfigurationService.getConfig();
    if (!globalConfig || !globalConfig?.data?.isChannelDataExists) {
      //It means we are going to create channels first time.. Remove any garbadge data if previously inserted.
      const removed = await this.channelRepository.deleteMany({});
      // TODO: Logging..
      console.log(`channels removed count: ${removed}`);
    }

    let filterArray = [];

    for (let channel of mappedChannels.data) {
      filterArray.push({ Id: channel.Id });
    }

    let response: BaseDTO[] = null;
    if (channels.length > 0) {
      response = await this.channelRepository.insertIfNotExistsElseUpdate(
        channels,
        filterArray,
      );
      //Updating the Global Configuration..
      await this.globalConfigurationService.findReplaceConfig(
        globalConfig.data,
        {
          ...globalConfig.data,
          isChannelDataExists: true,
        },
      );
    }

    return ResponseHelper.CreateResponse<BaseDTO[]>(
      response,
      response ? HttpStatus.CREATED : HttpStatus.EXPECTATION_FAILED,
    );
  }

  /**
   * Fetch All channels from the collections
   * @returns ApiResponse<ChannelDto[]>
   */
  public async GetAllChannels(): Promise<ApiResponse<ChannelDTO[]>> {
    const data = await this.channelRepository.getAllChannels();
    let result = this.mapper.mapArray(data, Channel, ChannelDTO);
    return ResponseHelper.CreateResponse<ChannelDTO[]>(result, HttpStatus.OK);
  }

  /**
   * Fetch All channels from the collections based on region
   * @returns ApiResponse<ChannelDTO[]>
   */
  public async GetAllChannelsByRegion(
    region: string,
  ): Promise<ApiResponse<ChannelDTO[]>> {
    const data = await this.channelRepository.getAllChannelsByRegion(region);
    let result = this.mapper.mapArray(data, Channel, ChannelDTO);
    return ResponseHelper.CreateResponse<ChannelDTO[]>(result, HttpStatus.OK);
  }

  /**
   * Fetch All channels from the collections based on current platform
   * @param platformId It is the currently selected platform.
   * @returns ApiResponse<ChannelDTO[]>
   */
  public async GetAllChannelIdsByPlatform(
    platformId: string,
  ): Promise<ApiResponse<ChannelDTO[]>> {
    const data = await this.channelRepository.getAllChannelIdsByPlatform(
      platformId,
    );
    let result = this.mapper.mapArray(data, Channel, ChannelDTO);
    return ResponseHelper.CreateResponse<ChannelDTO[]>(result, HttpStatus.OK);
  }

  /**
   * This method will fetch channels based on the platforms and regions from Press Association Media API
   * @param platforms all platforms stored in our mongoDB.
   * @returns ChannelDTO[] this will contains all channels with their platforms and regions.
   */
  private async mapChannelsBasedOnPlatformsAndRegion(
    platforms: PlatformDTO[],
  ): Promise<ApiResponse<ChannelDTO[]>> {
    let channelResponses = [];
    let finalChannels: ChannelDTO[] = [];
    console.log(
      `Start Grabbing of channels based on platforms and regions: ${new Date()}`,
    );
    if (!platforms.length) {
      console.log(`No platform has been found. Existing this process..`);
      return ResponseHelper.CreateResponse<ChannelDTO[]>([], HttpStatus.OK);
    }
    for (let platform of platforms) {
      for (let region of platform.regions) {
        const result = await this.axios.get<PressAssociationAPIResponse<any>>({
          endpoint: `/channel?platformId=${platform.platformId}&regionId=${
            region.regionId
          }&date=${new Date()}`,
        });
        for (let item of result.item) {
          for (let media of item.media) {
            // Fetching first non-empty logo element
            if (media.rendition?.default?.href) {
              channelResponses.push({
                channelId: item.id,
                channelName: item.title,
                category: item.category,
                channelLogo: media.rendition?.default?.href,
                platformId: platform.platformId,
                platformName: platform.platformName,
                regionId: region.regionId,
                regionName: region.regionName,
              });
            }
            break;
          }
        }
      }
    }
    console.log(
      `End Grabbing of channels based on platforms and regions: ${new Date()}`,
    );
    // Now we have all the channels with their associated platforms and region..
    channelResponses.sort(
      (a, b) =>
        a.channelId.localeCompare(b.channelId) ||
        a.platformId.localeCompare(b.platformId),
    );
    let prevChannelId = channelResponses[0].channelId;
    let prevPlatformId = channelResponses[0].platformId;
    let channelRegions: RegionDTO[] = [];
    let channelPlatforms: PlatformDTO[] = [];
    let prevPlatform: PlatformDTO = null;
    let prevChannel = null;
    console.log(
      `Start Preparing of channels based on platforms and regions: ${new Date()}`,
    );
    // TODO: Refactoring required.
    for (let channelResponse of channelResponses.entries()) {
      if (prevChannelId === channelResponse[1].channelId) {
        if (prevPlatformId === channelResponse[1].platformId) {
          if (
            !CommonFunctions.IfExists(
              channelRegions,
              (v) => v.regionId === channelResponse[1].regionId,
            )
          ) {
            channelRegions.push({
              regionId: channelResponse[1].regionId,
              regionName: channelResponse[1].regionName,
            });
          }
        } else {
          prevPlatform = channelPlatforms.find(
            (cp: PlatformDTO) => cp.platformId === prevPlatformId,
          );
          if (prevPlatform) {
            prevPlatform.regions.push(...channelRegions);
            channelRegions = [];
          }
          prevPlatformId = channelResponse[1].platformId;
        }

        if (
          !CommonFunctions.IfExists(
            channelPlatforms,
            (v) => v.platformId === channelResponse[1].platformId,
          )
        ) {
          channelPlatforms.push({
            platformId: channelResponse[1].platformId,
            platformName: channelResponse[1].platformName,
            regions: [
              {
                regionId: channelResponse[1].regionId,
                regionName: channelResponse[1].regionName,
              },
            ],
          });
        }
        prevChannel = channelResponse[1];
      } else {
        finalChannels.push({
          Id: prevChannel.channelId,
          title: prevChannel.channelName,
          categories: prevChannel.category,
          logo: prevChannel.channelLogo,
          platforms: channelPlatforms,
        });
        channelPlatforms = [];
        channelRegions = [];
        prevChannel = channelResponse[1];
        prevChannelId = channelResponse[1].channelId;

        if (
          !CommonFunctions.IfExists(
            channelRegions,
            (v) => v.regionId === channelResponse[1].regionId,
          )
        ) {
          channelRegions.push({
            regionId: channelResponse[1].regionId,
            regionName: channelResponse[1].regionName,
          });
        }
        if (
          !CommonFunctions.IfExists(
            channelPlatforms,
            (v) => v.platformId === channelResponse[1].platformId,
          )
        ) {
          channelPlatforms.push({
            platformId: channelResponse[1].platformId,
            platformName: channelResponse[1].platformName,
            regions: [
              {
                regionId: channelResponse[1].regionId,
                regionName: channelResponse[1].regionName,
              },
            ],
          });
        }
      }
    }
    console.log(
      `End Preparing of channels based on platforms and regions: ${new Date()}`,
    );
    return ResponseHelper.CreateResponse<ChannelDTO[]>(
      finalChannels,
      HttpStatus.OK,
    );
  }
}
