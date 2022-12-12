import { InjectMapper } from '@automapper/nestjs';
import ResponseHelper from '@Helper/response-helper';
import { Platform, PlatformDocument } from '@Entities/platform.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PlatformRepository } from '@Repository/platform.repository';
import ApiResponse from '@Helper/api-response';
import { Mapper } from '@automapper/core';
import { Mapper as MapperToCreate } from '@automapper/types';
import AxiosHelper from '@Helper/axios.helper';
import { GlobalConfigurationService } from './global-configuration.service';
import { platforms } from '../../ignore-platforms.json';
import { PlatformDTO } from '@DTO/platform.dto';
import { BaseDTO } from '@DTO/base.dto';
import { BaseAPIResponse } from '@DTO/press-association-api-responses/base.api.response';
import PressAssociationAPIResponse from '@Helper/press-association-api-response';
import { RegionDTO } from '@DTO/region.dto';

@Injectable()
export default class PlatformService {
  /**
   * Service to fetch platfroms list
   */
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    @InjectMapper() private readonly mapperToCreateEntity: MapperToCreate,
    private readonly platformRepository: PlatformRepository,
    private readonly globalConfiguration: GlobalConfigurationService,
    private readonly axios: AxiosHelper,
  ) {}

  async GetAllPlatforms(): Promise<ApiResponse<PlatformDTO[]>> {
    let data = await this.platformRepository.getAll();
    let result = this.mapper.mapArray(data, Platform, PlatformDTO);
    return ResponseHelper.CreateResponse<PlatformDTO[]>(result, HttpStatus.OK);
  }

  /**
   * This method is responsible for creating all the platforms and their associated regions in our MongoDB instance
   * from press association media
   */
  async CreateAllPlatforms(): Promise<ApiResponse<BaseDTO[]>> {
    const platforms = await this.mapPlatformsAgainstTheirRegions();
    const result = this.mapperToCreateEntity.mapArray(
      platforms.data,
      Platform,
      PlatformDTO,
    );
    //Getting GlobalConfiguration To Check whether platform is going to create first time or not.
    const globalConfig = await this.globalConfiguration.getConfig();
    if (!globalConfig || !globalConfig?.data?.isPlatformDataExists) {
      //It means we are going to create platforms first time.. Remove any garbadge data if previously inserted.
      const removed = await this.platformRepository.deleteMany({});
      // TODO: Logging..
      console.log(`platforms removed count: ${removed}`);
    }
    let filterArray = [];

    for (let platform of platforms.data) {
      filterArray.push({ platformId: platform.platformId });
    }

    const response = await this.platformRepository.insertIfNotExistsElseUpdate(
      result,
      filterArray,
    );
    //Updating the Global Configuration..
    await this.globalConfiguration.findReplaceConfig(globalConfig.data, {
      ...globalConfig.data,
      isPlatformDataExists: true,
    });
    return ResponseHelper.CreateResponse<BaseDTO[]>(
      response,
      HttpStatus.CREATED,
    );
  }

  /**
   * It will fetch all platform's region data from Press Association Media API and map them inside Platform DTO so that it can be
   * stored in mongoDB.
   */
  private async mapPlatformsAgainstTheirRegions(): Promise<
    ApiResponse<PlatformDTO[]>
  > {
    let result = await this.getAllPlatformsFromPressAssociation();
    // Filter those platforms which are not included for now for the sake of requirement.
    if (result.data?.length) {
      result.data = result.data.filter(
        (p) => !platforms.includes(p.platformName),
      );
    }
    try {
      let response: PressAssociationAPIResponse<BaseAPIResponse> = null;
      for (let platform of result.data) {
        response = await this.axios.get<
          PressAssociationAPIResponse<BaseAPIResponse>
        >({
          endpoint: `/platform/${platform.platformId}/region`,
        });
        const regions = this.mapper.mapArray(
          response.item,
          BaseAPIResponse,
          RegionDTO,
        );
        platform.regions = regions;
      }
    } catch (e) {
      // TODO:
      console.log(e);
    }
    return ResponseHelper.CreateResponse<PlatformDTO[]>(
      result?.data,
      result?.data?.length > 0 ? HttpStatus.OK : HttpStatus.NOT_FOUND,
    );
  }

  /**
   * It will fetch all platforms data from Press Association Media API
   */
  private async getAllPlatformsFromPressAssociation(): Promise<
    ApiResponse<PlatformDTO[]>
  > {
    const result = await this.axios.get<
      PressAssociationAPIResponse<BaseAPIResponse>
    >({
      endpoint: `/platform`,
    });
    const platforms = this.mapper.mapArray(
      result.item,
      BaseAPIResponse,
      PlatformDTO,
    );
    return ResponseHelper.CreateResponse<PlatformDTO[]>(
      platforms,
      platforms?.length > 0 ? HttpStatus.OK : HttpStatus.NOT_FOUND,
    );
  }

  /**
   * This method is used in region service to insert unique regions in our db.
   * @param regions This is all regions which we get based on platforms.
   * @returns RegionDTO[] unique regions.
   */
  public async GetAllRegions(): Promise<ApiResponse<RegionDTO[]>> {
    let regions: RegionDTO[] = [];
    const platforms = await this.GetAllPlatforms();
    if (platforms.data?.length) {
      for (let platform of platforms.data) {
        regions.push(...platform.regions);
      }
    }
    return ResponseHelper.CreateResponse<RegionDTO[]>(regions, HttpStatus.OK);
  }
}
