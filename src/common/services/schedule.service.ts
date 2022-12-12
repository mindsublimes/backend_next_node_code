import { ScheduleRepository } from '@Repository/schedule.repository';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AssetScheduleDTO } from '@DTO/asset-schedule.dto';
import ApiResponse from '@Helper/api-response';
import { BaseDTO } from '@DTO/base.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Mapper as MapperToCreate } from '@automapper/types';
import { Schedule } from '@Entities/schedule.entity';
import ResponseHelper from '@Helper/response-helper';
import { ElasticSearchService } from './elastic-search.service';
import { ChannelAssetScheduleDTO } from '@DTO/channel-asset-schedule.dto';
import { AssetScheduleRequestDTO } from '@DTO/asset-schedule-request.dto';
import { ChannelService } from './channel.service';
import { ChannelAssetScheduleResponseDTO } from '@DTO/channel-asset-schedule-response.dto';
import moment from 'moment';
import { CommonFunctions } from '../utils/common-functions';
import Constants from '@Helper/constants';

/**
 * This service is responsible for handling asset (program) document and its related operations.
 */
@Injectable()
export class ScheduleService {
  /**
   * This is constructor which is used to initialize the schedule repository..
   */
  // During the mapping this library is trying to create instance for the mongoDB document which is prohibitted so that's why just for type inference
  // Importing other mapper module from the same library
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    @InjectMapper() private readonly mapperToCreateEntity: MapperToCreate,
    private scheduleRepository: ScheduleRepository,
    private elasticSearchService: ElasticSearchService,
    private channelService: ChannelService,
  ) {}

  /**
   * @param schedules these are the multiple assets schedules based on particular platform..
   * @returns it will return the ids of newly created items in DB.s
   */
  public async CreateSchedule(
    schedules: AssetScheduleDTO[],
  ): Promise<ApiResponse<BaseDTO[]>> {
    console.log('total schedules ' + schedules.length);
    try {
      let entities = this.mapperToCreateEntity.mapArray(
        schedules,
        Schedule,
        AssetScheduleDTO,
      );
      let result = await this.scheduleRepository.createMultiple(entities);
      return ResponseHelper.CreateResponse<BaseDTO[]>(
        result,
        HttpStatus.CREATED,
      );
    } catch (e) {
      return ResponseHelper.CreateResponse<any>(
        e,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * @params startDate: Date is used to delete records from this particular time.
   * @params endDate: Date is used to delete records till this date.
   * @returns true/false whether this operation is successfull or not.
   */
  public async DeleteSchedulesWithinRange(
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<number>> {
    const sDate = new Date(startDate);
    sDate.setUTCHours(0, 0, 0, 0);
    const eDate = new Date(endDate);
    eDate.setUTCHours(23, 59, 59, 59);
    const response = await this.scheduleRepository.deleteMany({
      $and: [
        {
          startDate: {
            $gte: sDate,
          },
        },
        {
          startDate: {
            $lte: eDate,
          },
        },
      ],
    });
    return ResponseHelper.CreateResponse<number>(response, HttpStatus.OK);
  }

  /**
   * This method is responsible for fetching data of schedules against an asset from our MongoDB.
   * @param assetId it is the unique id of a partcular asset
   * @returns ApiResponse<AssetScheduleDTO> It will return the asset schedule from our MongoDB
   *  wrapped inside ApiResponse to maintain generic response
   */
  public async GetAssetSchedule(
    assetId: string,
  ): Promise<ApiResponse<AssetScheduleDTO>> {
    try {
      const result = await this.scheduleRepository.GetAssetSchedule({
        assetId: assetId,
      });
      const response = this.mapper.map(result, Schedule, AssetScheduleDTO);
      if (response) {
        return ResponseHelper.CreateResponse<AssetScheduleDTO>(
          response,
          HttpStatus.OK,
        );
      } else {
        return ResponseHelper.CreateResponse<AssetScheduleDTO>(
          null,
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (e) {
      console.log(e);
      return ResponseHelper.CreateResponse<AssetScheduleDTO>(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * This method is responsible for fetching schedule's of assets from elastic search.
   * @params filters this contains the object coming from front-end / UI for selected filters. i.e channels, date/time etc.
   * @returns ChannelAssetScheduleResponseDTO it's the specialized object[] which is used to bind front-end asset schedule time
   * listing control
   */
  public async GetAssetsSchedules(
    filters: AssetScheduleRequestDTO,
  ): Promise<ApiResponse<ChannelAssetScheduleResponseDTO[]>> {
    try {
      // TODO: Refactoring required.
      let query = null;
      if (!filters.category || filters.category === 'all') {
        query = {
          sort: [
            {
              'document.channelTitle.keyword': {
                order: 'asc',
              },
            },
            {
              'document.startDate': {
                order: 'asc',
              },
            },
          ],
          size: 1000,
          query: {
            bool: {
              must: [
                {
                  range: {
                    'document.startDate': {
                      gte: filters.selectedStartDateTime.split(' ')[0],
                      lte: filters.selectedEndDateTime.split(' ')[0],
                    },
                  },
                },
                {
                  terms: {
                    'document.platforms.platformId.keyword': [
                      filters.platformId,
                    ],
                  },
                },
              ],
            },
          },
        };
      } else {
        query = {
          sort: [
            {
              'document.channelTitle.keyword': {
                order: 'asc',
              },
            },
            {
              'document.startDate': {
                order: 'asc',
              },
            },
          ],
          size: 1000,
          query: {
            bool: {
              must: [
                {
                  range: {
                    'document.startDate': {
                      gte: filters.selectedStartDateTime.split(' ')[0],
                      lte: filters.selectedEndDateTime.split(' ')[0],
                    },
                  },
                },
                {
                  terms: {
                    'document.category.code.keyword': [filters.category],
                  },
                },
                {
                  terms: {
                    'document.platforms.platformId.keyword': [
                      filters.platformId,
                    ],
                  },
                },
              ],
            },
          },
        };
      }
      const startDate = CommonFunctions.GetDate(
        filters.selectedStartDateTime.split(' ')[0],
      );
      const endDate = CommonFunctions.GetDate(
        filters.selectedEndDateTime.split(' ')[0],
      );
      let result =
        await this.elasticSearchService.FetchData<ChannelAssetScheduleDTO>(
          `mongodbschema_schedules/_search?filter_path=hits.hits._source.document`,
          query,
        );
      let response: ChannelAssetScheduleResponseDTO[] = [];
      let channelAssets = [];
      let prevChannelId = result.data[0];
      let difference = null;
      for (let channelAsset of result.data.entries()) {
        if (prevChannelId.channelId === channelAsset[1].channelId) {
          if (
            moment(channelAsset[1].startDate).isSame(
              moment(channelAsset[1].endDate),
            )
          )
            continue;
          channelAssets.push(channelAsset[1]);
          if (channelAsset[0] === result.data.length - 1) {
            channelAssets.map((c) => {
              c.startDate = CommonFunctions.GetDate(c.startDate);
              c.endDate = CommonFunctions.GetDate(c.endDate);
              return c;
            });
            let prevStartTime = startDate;
            for (let channelAsset of channelAssets) {
              if (
                prevStartTime.isBefore(
                  CommonFunctions.GetDate(channelAsset.startDate),
                ) &&
                channelAsset.assetId !== ''
              ) {
                difference = Math.abs(
                  CommonFunctions.GetDate(prevStartTime).diff(
                    CommonFunctions.GetDate(channelAsset.startDate),
                    'minutes',
                  ),
                );
                let t = new ChannelAssetScheduleDTO();
                t.channelId = '';
                t.assetId = '';
                t.scheduleId = '';
                t.title = 'No Program';
                t.startDate = CommonFunctions.GetDate(prevStartTime) as any;
                t.endDate = CommonFunctions.GetDate(
                  channelAsset.startDate,
                ) as any;
                t.duration = difference;
                t.image = '';
                t.category = null;
                t.channelTitle = '';
                channelAssets.push(t);
              }
              prevStartTime = CommonFunctions.GetDate(channelAsset.endDate);
            }

            let sortedAsc = channelAssets.sort(
              (objA, objB) =>
                CommonFunctions.GetDate(objA.startDate).unix() -
                CommonFunctions.GetDate(objB.startDate).unix(),
            );
            if (sortedAsc?.length) {
              let lstElem = sortedAsc[sortedAsc.length - 1].endDate;
              let difference = Math.abs(
                moment(lstElem).diff(startDate, 'minutes'),
              );
              if (
                CommonFunctions.GetDate(lstElem).isBefore(
                  CommonFunctions.GetDate(endDate),
                )
              ) {
                sortedAsc.push({
                  channeld: '',
                  title: 'No Program',
                  startDate: CommonFunctions.GetDate(lstElem),
                  endDate: CommonFunctions.GetDate(endDate),
                  duration: difference,
                });
              }
            } else {
              sortedAsc.push({
                channeld: '',
                title: 'No Program',
                startDate: CommonFunctions.GetDate(startDate),
                endDate: CommonFunctions.GetDate(endDate),
                duration: difference,
              });
            }
            response.push({
              channelsAssetsSchedules: {
                channel: {
                  id: channelAsset[1].channelId,
                  title: channelAsset[1].channelTitle,
                  logo: channelAsset[1].channelLogo,
                },
                assetSchedules: sortedAsc,
              },
            });
            channelAssets = [];
            prevChannelId = channelAsset[1];
          }
        } else {
          channelAssets.map((c) => {
            c.startDate = CommonFunctions.GetDate(c.selectedStartDateTime);
            c.endDate = CommonFunctions.GetDate(c.endDate);
            return c;
          });
          let prevStartTime = startDate;
          for (let channelAsset of channelAssets) {
            if (
              prevStartTime.isBefore(
                CommonFunctions.GetDate(channelAsset.startDate),
              ) &&
              channelAsset.assetId !== ''
            ) {
              difference = Math.abs(
                moment(prevStartTime).diff(
                  CommonFunctions.GetDate(channelAsset.startDate),
                  'minutes',
                ),
              );
              let t = new ChannelAssetScheduleDTO();
              t.channelId = '';
              t.assetId = '';
              t.scheduleId = '';
              t.title = 'No Program';
              t.startDate = CommonFunctions.GetDate(prevStartTime).format(
                Constants.UTC_STRING_FORMAT,
              ) as any;
              t.endDate = CommonFunctions.GetDate(
                channelAsset.startDate,
              ).format(Constants.UTC_STRING_FORMAT) as any;
              t.duration = difference;
              t.image = '';
              t.category = null;
              t.channelTitle = '';

              channelAssets.push(t);
            }
            prevStartTime = CommonFunctions.GetDate(channelAsset.endDate);
          }

          let sortedAsc = channelAssets.sort(
            (objA, objB) =>
              CommonFunctions.GetDate(objA.startDate).unix() -
              CommonFunctions.GetDate(objB.startDate).unix(),
          );
          if (sortedAsc?.length) {
            let lstElem = CommonFunctions.GetDate(
              sortedAsc[sortedAsc.length - 1].endDate,
            );
            let difference = Math.abs(moment(lstElem).diff(endDate, 'minutes'));
            if (
              CommonFunctions.GetDate(lstElem).isBefore(
                CommonFunctions.GetDate(endDate),
              )
            ) {
              sortedAsc.push({
                channeld: '',
                title: 'No Program',
                startDate: lstElem,
                endDate: CommonFunctions.GetDate(endDate),
                duration: difference,
              });
            }
          } else {
            sortedAsc.push({
              channeld: '',
              title: 'No Program',
              startDate: startDate.format(Constants.UTC_STRING_FORMAT),
              endDate: endDate.format(Constants.UTC_STRING_FORMAT),
              duration: Math.abs(moment(startDate).diff(endDate, 'minutes')),
            });
          }
          channelAssets.push(channelAsset[1]);
          prevChannelId = channelAsset[1];
          channelAssets = [];
          response.push({
            channelsAssetsSchedules: {
              channel: {
                id: channelAsset[1].channelId,
                title: channelAsset[1].channelTitle,
                logo: channelAsset[1].channelLogo,
              },
              assetSchedules: sortedAsc,
            },
          });
        }
      }
      const finalResult = ResponseHelper.CreateResponse<
        ChannelAssetScheduleResponseDTO[]
      >(response, HttpStatus.OK);
      return finalResult;
    } catch (e) {
      console.log('comes in error block of schedule');
      console.log(e);
      const finalResult = ResponseHelper.CreateResponse<
        ChannelAssetScheduleResponseDTO[]
      >(null, HttpStatus.BAD_REQUEST);
      return finalResult;
    }
  }
}
