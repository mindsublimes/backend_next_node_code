import { Controller, Get } from '@nestjs/common';
import { RegionService } from '@Services/region.service';

@Controller('region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  /** method fetches all regions.
   * @returns returns all regions
   */
  @Get('/getAll')
  async GetRegions() {
    let res = await this.regionService.getAllRegions();
    return res;
  }

  @Get('/seed')
  public async SeedRegions() {
    return await this.regionService.CreateRegions();
  }
}
