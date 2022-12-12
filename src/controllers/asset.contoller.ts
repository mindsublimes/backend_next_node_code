import { Body, Controller, Get, Post, Query } from '@nestjs/common';
// import AssetService from '@Service/asset.service';
import { AssetService } from '@Services/asset.service';
@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  /**
   * @param assetId currently selected asset
   * @returns contains asset details from our mongo DB
   */
  @Get('/getAssetDetails')
  public async GetAssetDetails(@Query('assetId') assetId: string) {
    let response = await this.assetService.GetAssetDetails(assetId);
    return response;
  }
}
