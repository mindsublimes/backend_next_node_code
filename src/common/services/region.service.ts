import { RegionRepository } from '@Repository/region.repository';
import { HttpStatus, Injectable } from '@nestjs/common';
import ResponseHelper from '@Helper/response-helper';
import ApiResponse from '@Helper/api-response';
import { Region } from '@Entities/region.entity';
import { Mapper } from '@automapper/core';
import { Mapper as MapperToCreate } from '@automapper/types';
import { InjectMapper } from '@automapper/nestjs';
import { RegionDTO } from '@DTO/region.dto';
import { BaseDTO } from '@DTO/base.dto';
import { GlobalConfigurationService } from './global-configuration.service';
import PlatformService from './platform.service';
/**
 * This service is responsible for handling asset (program) document and its related operations.
 */
@Injectable()
export class RegionService {
  /**
   * This is constructor which is used to initialize the schedule repository..
   */
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    @InjectMapper() private readonly mapperToCreateEntity: MapperToCreate,
    private regionRepository: RegionRepository,
    private readonly globalConfiguration: GlobalConfigurationService,
    private readonly platformService: PlatformService,
  ) {}

  /**
   * This method is responsible getting all regions from region collection
   * @returns region response dto
   */
  public async getAllRegions(): Promise<ApiResponse<RegionDTO[]>> {
    let result = await this.regionRepository.getAll();
    let response = this.mapper.mapArray(result, Region, RegionDTO);
    if (result) {
      return ResponseHelper.CreateResponse<RegionDTO[]>(
        response,
        HttpStatus.OK,
      );
    } else {
      return ResponseHelper.CreateResponse<RegionDTO[]>(
        null,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * This method is fetching regions stored in platform collection and dump it in our region collection
   * but these regions will be unique. This method only run after platform's binding.
   *
   * @params regions: RegionDTO[] this is all the regions binded with platforms in our mongoDB.
   * @returns new added regionIds in our collection
   */

  public async CreateRegions(): Promise<ApiResponse<BaseDTO[]>> {
    const regions = await this.platformService.GetAllRegions();
    let uniqueRegions: RegionDTO[] = [];
    //Getting GlobalConfiguration To Check whether platform is going to create first time or not.
    const globalConfig = await this.globalConfiguration.getConfig();
    if (!globalConfig || !globalConfig?.data?.isRegionDataExists) {
      //It means we are going to create platforms first time.. Remove any garbadge data if previously inserted.
      const removed = await this.regionRepository.deleteMany({});
      // TODO: Logging..
      console.log(`regions removed count: ${removed}`);
    }
    let filterArray = [];
    uniqueRegions = [
      ...new Map(regions.data.map((item) => [item.regionName, item])).values(),
    ];
    const result = this.mapperToCreateEntity.mapArray(
      uniqueRegions,
      Region,
      RegionDTO,
    );

    console.log('regions unique');
    console.log(uniqueRegions);

    for (let region of uniqueRegions) {
      filterArray.push({ regionId: region.regionId });
    }

    const response = await this.regionRepository.insertIfNotExistsElseUpdate(
      result,
      filterArray,
    );
    //Updating the Global Configuration..
    await this.globalConfiguration.findReplaceConfig(globalConfig.data, {
      ...globalConfig.data,
      isRegionDataExists: true,
    });

    return ResponseHelper.CreateResponse<BaseDTO[]>(response, HttpStatus.OK);
  }
}
