import ApiResponse from '@Helper/api-response';
import { Controller, Delete, Get, Post, Query, UsePipes } from '@nestjs/common';
import { ScheduleService } from '@Services/schedule.service';
import { ValidationPipe } from '@nestjs/common';
import { AssetScheduleRequestDTO } from '@DTO/asset-schedule-request.dto';
import { ChannelAssetScheduleResponseDTO } from '@DTO/channel-asset-schedule-response.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Delete()
  //TODO: These parameters must be date javascript object.
  public async RemoveSchedulesWithinRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.scheduleService.DeleteSchedulesWithinRange(
      startDate,
      endDate,
    );
  }

  @Get('/list')
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  async GetSchedulesFromElasticDB(
    @Query() filters: AssetScheduleRequestDTO,
  ): Promise<ApiResponse<ChannelAssetScheduleResponseDTO[]>> {
    const result = await this.scheduleService.GetAssetsSchedules(filters);
    return result;
  }
}
