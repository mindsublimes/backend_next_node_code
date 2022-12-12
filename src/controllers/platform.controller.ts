import ApiResponse from '@Helper/api-response';
import PlatformService from '@Services/platform.service';
import { Controller, Get } from '@nestjs/common';
@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Get()
  public async GetPlatform() {
    return await this.platformService.GetAllPlatforms();
  }

  @Get('/seed')
  public async SeedPlatforms() {
    return await this.platformService.CreateAllPlatforms();
  }
}
