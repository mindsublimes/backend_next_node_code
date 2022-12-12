import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import ResponseHelper from '@Helper/response-helper';
import { HttpStatus, Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { addMinutes } from 'date-fns';
import ApiResponse from '@Helper/api-response';
import { ScheduleService } from './schedule.service';
import { AssetCalendarResponseDTO } from '@DTO/asset-calendar-response.dto';
import { AssetScheduleDTO } from '@DTO/asset-schedule.dto';

/**
 * This service is responsible for handling asset (program) document and its related operations.
 */
@Injectable()
export class AssetService {
  /**
   * This is constructor which is used to initialize the asset repository..
   */
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private scheduleService: ScheduleService,
  ) {}
  /**
   * This method is responsible for fetching asset details from third party api
   * @param assetId currently selected asset Id
   * @returns it will returns the total asset details against the program
   */
  public async GetAssetDetails(
    assetId: string,
  ): Promise<ApiResponse<AssetCalendarResponseDTO>> {
    try {
      let response = await this.scheduleService.GetAssetSchedule(assetId);
      let assetDetail = this.mapper.map(
        response?.data,
        AssetScheduleDTO,
        AssetCalendarResponseDTO,
      );
      if (assetDetail) {
        assetDetail.programStartTime = format(
          new Date(response.data.startDate),
          'p',
        );
        const programEndTime = addMinutes(
          new Date(response.data.endDate),
          response.data.duration,
        ).toString();
        assetDetail.programEndTime = format(new Date(programEndTime), 'p');
        assetDetail.programStartDate = format(
          response.data.startDate,
          'do  MMMM yyyy',
        );
        assetDetail.calendarStartDate = format(
          response.data.startDate,
          'yyyy-MM-dd',
        ).toString();
        assetDetail.calendarEndDate = format(
          response.data.endDate,
          'yyyy-MM-dd',
        ).toString();
        assetDetail.calendarStartTime = format(
          new Date(response.data.startDate),
          'HH:MM',
        ).toString();
        assetDetail.calendarEndTime = format(
          new Date(response.data.endDate),
          'HH:MM',
        ).toString();
        return ResponseHelper.CreateResponse<AssetCalendarResponseDTO>(
          assetDetail,
          HttpStatus.OK,
        );
      } else {
        return ResponseHelper.CreateResponse<AssetCalendarResponseDTO>(
          null,
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (e) {
      return ResponseHelper.CreateResponse<AssetCalendarResponseDTO>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
