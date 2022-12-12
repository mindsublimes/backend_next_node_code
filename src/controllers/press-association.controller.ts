import { BaseDTO } from '@DTO/base.dto';
import ApiResponse from '@Helper/api-response';
import { ElasticSearchService } from '@Services/elastic-search.service';
import { Controller, Get } from '@nestjs/common';
import { PressAssociationService } from '@Services/press-association.service';

@Controller('pressassociation')
export class PressAssociationController {
  constructor(
    private readonly pressAssociationService: PressAssociationService,
    private readonly elasticSearchService: ElasticSearchService,
  ) {}

  @Get('/assetsSchedule')
  async assetSchedules(): Promise<ApiResponse<BaseDTO[]>> {
    return await this.pressAssociationService.FetchChannelsAssetsSchedule();
  }
}
