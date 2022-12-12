import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Mapper as MapperToCreate } from '@automapper/types';
import { GlobalConfigurationDTO } from '@DTO/global-configuration.dto';
import ApiResponse from '@Helper/api-response';
import ResponseHelper from '@Helper/response-helper';
import { GlobalConfigurationRepository } from '@Repository/global-configuration.repository';
import { GlobalConfiguration } from '@Entities/global-configuration.entity';
import { HttpStatus, Injectable } from '@nestjs/common';

/**
 * This service is responsible for handling global configuration of the application and its related operations.
 */
@Injectable()
export class GlobalConfigurationService {
  /**
   * This is constructor which is used to initialize the global configuration repository..
   */
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    @InjectMapper() private readonly mapperToCreateEntity: MapperToCreate,
    private globalConfigurationRepository: GlobalConfigurationRepository,
  ) {}

  /**
   * This method is used to fetch configuration defined in the document.
   * @returns it will return the defined configuration
   */
  public async getConfig(): Promise<ApiResponse<GlobalConfigurationDTO>> {
    let response = await this.globalConfigurationRepository.getFistOne();
    if (response?._id) {
      const result = this.mapper.map(
        response,
        GlobalConfiguration,
        GlobalConfigurationDTO,
      );
      return ResponseHelper.CreateResponse(result, HttpStatus.OK);
    } else {
      return ResponseHelper.CreateResponse(null, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * This methods used to find and replace the new configuration based on the filter passed.
   * @param filter it is the filter to find particular document. {} is specified to
   * @param configuration this is the new configuration object which will be going to replace the object.
   * @returns it will return true/false based on the operation's status.
   */
  public async findReplaceConfig(
    filter: GlobalConfigurationDTO,
    configuration: GlobalConfigurationDTO,
  ): Promise<ApiResponse<boolean>> {
    let entity = this.mapperToCreateEntity.map(
      configuration,
      GlobalConfiguration,
      GlobalConfigurationDTO,
    );
    let response = await this.globalConfigurationRepository.replaceOne(
      {},
      entity,
    );
    if (response.acknowledged) {
      return ResponseHelper.CreateResponse(true, HttpStatus.OK);
    } else {
      return ResponseHelper.CreateResponse(false, HttpStatus.NOT_FOUND);
    }
  }

  /**
   *
   * @param configuration this is only used create configuration first time.
   * @returns it will return true/false based on the operation's status.
   */
  public async createConfig(
    configuration: GlobalConfigurationDTO,
  ): Promise<ApiResponse<boolean>> {
    let entity = this.mapperToCreateEntity.map(
      configuration,
      GlobalConfiguration,
      GlobalConfigurationDTO,
    );
    let response = await this.globalConfigurationRepository.create(entity);
    if (response.id) {
      return ResponseHelper.CreateResponse(true, HttpStatus.OK);
    } else {
      return ResponseHelper.CreateResponse(false, HttpStatus.NOT_FOUND);
    }
  }
}
