import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { AssetCategoryDTO } from '@DTO/asset-category.dto';
import { AssetScheduleDTO } from '@DTO/asset-schedule.dto';
import { BaseDTO } from '@DTO/base.dto';
import { GlobalConfigurationDTO } from '@DTO/global-configuration.dto';
import ApiResponse from '@Helper/api-response';
import AxiosHelper from '@Helper/axios.helper';
import Constants from '@Helper/constants';
import ResponseHelper from '@Helper/response-helper';
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { add } from 'date-fns';
import { ChannelService } from './channel.service';
import { GlobalConfigurationService } from './global-configuration.service';
import { ScheduleService } from './schedule.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import { ChannelDTO } from '@DTO/channel.dto';

/**
 * This Service is responsible to manage data from an API and store it into mongoDB.
 * It will also be responsible for managing seed data i.e grab master records for first time...
 */
@Injectable()
export class PressAssociationService implements OnModuleInit {
  /**
   * This is constructor where we are injecting multiple services in order to store data..
   */
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private scheduleService: ScheduleService,
    private channelService: ChannelService,
    private globalConfigurationService: GlobalConfigurationService,
    private configurationService: ConfigService,
    private schedulerRegistry: SchedulerRegistry,
    private axios: AxiosHelper,
  ) {}
  onModuleInit() {
    const job = new CronJob(
      this.configurationService.get<string>('CRON_EXPR'),
      async () => {
        try {
          await this.FetchChannelsAssetsSchedule();
        } catch (e) {
          console.log(e);
        }
      },
    );
    this.schedulerRegistry.addCronJob(`FETCH CHANNEL PROGRAM'S SCHEDULES`, job);
    job.start();
  }

  /**
   * It is basically fetching channel's asset's schedules.
   * First time it will fetch the data for all channels for 14 days.
   * Then from next day onwards it will fetch the data for every 15th day from now and will dump that inside our mongoDB.
   */
  public async FetchChannelsAssetsSchedule(): Promise<ApiResponse<BaseDTO[]>> {
    // Grab channels..
    console.log(`Grabbing channels from DB ${new Date()}`);
    const channels = await this.channelService.GetAllChannels();
    console.log(`Grab channels at ${new Date()}`);
    //TODO: Need to return appropriate response
    let scheduleResult: ApiResponse<BaseDTO[]> = ResponseHelper.CreateResponse<
      BaseDTO[]
    >(null, HttpStatus.OK);
    try {
      //Here we will be fetching channels platform wise
      console.log(`process started: ${new Date()}`);
      let IsJobRunForFirstTime: boolean;
      const intervalConfiguration =
        await this.globalConfigurationService.getConfig();
      if (intervalConfiguration.data) {
        IsJobRunForFirstTime =
          intervalConfiguration.data.isJobHasBeenRunningFirstTime;
      } else {
        const config = new GlobalConfigurationDTO();
        config.isJobHasBeenRunningFirstTime = true;
        await this.globalConfigurationService.createConfig(config);
        IsJobRunForFirstTime = true;
      }
      this.processChannelsAssetSchedule(channels.data, IsJobRunForFirstTime)
        .then((assets: AssetScheduleDTO[]) => {
          console.log(`total assets ${assets.length}`);
          console.log(`process ended: ${new Date()}`);
          console.log(`starting dumping in DB ${new Date()}`);
          if (assets.length) {
            return this.storeSchedulesInDB(assets);
          } else {
            return new Promise((resolve) => resolve([]));
          }
        })
        .then(async (value: any) => {
          console.log(`finish dumping in DB ${new Date()}`);
          const existingConfig =
            await this.globalConfigurationService.getConfig();
          await this.globalConfigurationService.findReplaceConfig(
            existingConfig.data,
            { ...existingConfig.data, isJobHasBeenRunningFirstTime: false },
          );
        })
        .catch((e) => {
          console.log(' in exception');
          console.log(e);
        });
    } catch (e: any) {
      // TODO: Will add logging..
      console.error('Error in main thread');
      console.log(e);
    } finally {
      return scheduleResult;
    }
  }

  private async processChannelsAssetSchedule(
    channels: ChannelDTO[],
    isJobRunFirstTIme: boolean,
    alreadyMappedChannels: any[] = null,
  ): Promise<AssetScheduleDTO[]> {
    return new Promise((resolve, reject) => {
      let intervalToCallAPI: number = 0;
      // List of channels which are failed to get the data during this process. It be re-fetched again..
      let failedChannels = [];
      // It's the channel's asset schedule response in a mapped form so it will be inserted in our DB as it is.
      // we are recursively calling this so if we have already successfully mapped channels so we are just re-assigning that.
      let assetMappedResponse: AssetScheduleDTO[] = alreadyMappedChannels || [];
      // Counter to determine how many channels has been processed and return control to caller once all channels get
      // processed.
      let numberOfChannelsProcessed = 0;

      //Store data after mapping response from API
      let apiMappedResponse: AssetScheduleDTO[] = [];
      const API_INTERVAL_GAP = parseInt(
        this.configurationService.get<string>('API_DATA_INTERVAL_GAP'),
      );
      const API_FETCH_INTERVAL = parseInt(
        this.configurationService.get<string>('API_DATA_FETCH_INTERVAL'),
      );
      for (let channel of channels) {
        intervalToCallAPI += API_FETCH_INTERVAL;
        ((interval, channel) => {
          setTimeout(async () => {
            try {
              let channelAssetScheduleResponse =
                await this.fetchChannelAndItsScheduleBasedOnInterval(
                  channel.Id,
                  isJobRunFirstTIme,
                );
              numberOfChannelsProcessed++;
              if (channelAssetScheduleResponse?.item?.length) {
                apiMappedResponse = this.mapAPIScheduleAPIResponse(
                  channelAssetScheduleResponse?.item,
                  channel,
                );
                assetMappedResponse.push(...apiMappedResponse);
              }
              if (numberOfChannelsProcessed === channels.length) {
                console.log(`failed Channels length ${failedChannels.length}`);
                // Calling again this if we have any failed channels
                if (failedChannels.length) {
                  setTimeout(() => {
                    console.log('calling again for failed channels');
                    this.processChannelsAssetSchedule(
                      failedChannels,
                      isJobRunFirstTIme,
                      assetMappedResponse,
                    ).then((r) => {
                      console.log('in internal resolve');
                      resolve(r);
                    });
                  }, API_INTERVAL_GAP);
                } else {
                  console.log(
                    `creating asset schedules ${assetMappedResponse.length}`,
                  );
                  resolve(assetMappedResponse);
                }
              }
            } catch (e) {
              numberOfChannelsProcessed++;
              if (channel.Id) {
                failedChannels.push({ id: channel.Id });
              }
              if (numberOfChannelsProcessed === channels.length) {
                console.log(`failed Channels length ${failedChannels.length}`);
                console.log(failedChannels);
                // Calling again this if we have any failed channels
                if (failedChannels.length) {
                  setTimeout(() => {
                    this.processChannelsAssetSchedule(
                      failedChannels,
                      isJobRunFirstTIme,
                      assetMappedResponse,
                    ).then((r) => {
                      console.log('in internal resolve');
                      resolve(r);
                    });
                  }, API_INTERVAL_GAP);
                } else {
                  console.log(
                    `creating asset schedules in catch ${assetMappedResponse.length}`,
                  );
                  resolve(assetMappedResponse);
                }
                reject(e);
              }
              //TODO: Logging required
            }
          }, interval);
        })(intervalToCallAPI, channel);
      }
    });
  }

  // TODO: Remove dead code.
  // private async *processAssetScheduleGenerator(channels) {
  //   for (let channel of channels) {
  //     try {
  //       yield this.processAssetSchedule(channel._id);
  //     } catch (e) {
  //       console.log(e);
  //       return null;
  //       // Will do some logging..
  //     }
  //   }
  // }

  /**
   * It will fetch channel and schedule for specified interval.
   * First time it will fetch 14 days data and then after wards it will fetch only 1day after 14 days.
   * @Params channelId this will be the channel for which we are going to fetch channel's schedule
   * @Params isFirstTimeCalled this is checking if cron job is running for very first time. By default it will be true.
   */
  private async fetchChannelAndItsScheduleBasedOnInterval(
    channelId: string,
    isFirstTimeCalled: boolean = true,
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const data = {
        cId: channelId,
        sDate: null,
        eDate: null,
      };
      // After first time we will grab fifteenth day data and dump it in our db.
      // As per the business rule on very first time we will fetch 14 days data and after wards we will fetch every fifteenth
      // day data.
      // Setting dates to start from next midnight
      // This job should be configured to run at every 10PM
      let sDate = new Date();
      let eDate = new Date();
      const NUMBER_OF_DAYS_TO_GET_DATA: number = parseInt(
        this.configurationService.get<string>('NUMBER_OF_DAYS_TO_GET_DATA'),
      );
      console.log(NUMBER_OF_DAYS_TO_GET_DATA);
      if (isFirstTimeCalled) {
        data.sDate = add(new Date(), {
          hours: 2,
        }).toISOString();
        eDate = new Date(new Date().setHours(0, 0, 0, 0));
        data.eDate = add(eDate, {
          days: NUMBER_OF_DAYS_TO_GET_DATA,
        }).toISOString();
      } else {
        sDate = add(new Date(new Date().setHours(0, 0, 0, 0)), {
          days: NUMBER_OF_DAYS_TO_GET_DATA,
        });
        data.sDate = sDate.toISOString();
        eDate = add(new Date(new Date().setHours(23, 59, 59, 0)), {
          days: NUMBER_OF_DAYS_TO_GET_DATA,
        });
        data.eDate = eDate.toISOString();
      }
      console.log(`Getting data from ${data.sDate} to ${data.eDate}`);
      const re = new RegExp(Object.keys(data).join('|'), 'gi');
      const url = Constants.CHANNEL_SCHEDULE_URL.replace(
        re,
        (matched) => data[matched],
      );
      try {
        const result = await this.axios.get({
          endpoint: url,
        });
        resolve(result);
      } catch (e) {
        // TODO: Error logging
        reject(e);
      }
    });
  }

  /**
   * It will be mapping API response into our mongoDB friendly schema.
   * @Params assetScheduleResponse it is schedule's API response.
   * @Returns scheduleDTOs it is the mapped response.
   */
  private mapAPIScheduleAPIResponse(
    assetScheduleResponse: any[],
    channel: ChannelDTO,
  ): AssetScheduleDTO[] {
    let scheduleDTOs: AssetScheduleDTO[] = [];
    let scheduleDTO: AssetScheduleDTO = null;
    let isAssetImageAvailable: boolean = false;
    for (let response of assetScheduleResponse) {
      scheduleDTO = new AssetScheduleDTO();
      scheduleDTO.channelId = channel.Id;
      scheduleDTO.scheduleId = response.id;
      scheduleDTO.assetId = response.asset?.id;
      scheduleDTO.title = response.title;
      scheduleDTO.duration = response.duration;
      scheduleDTO.startDate = response.dateTime;
      scheduleDTO.endDate = add(new Date(response.dateTime), {
        years: 0,
        months: 0,
        weeks: 0,
        days: 0,
        hours: 0,
        minutes: response.duration,
        seconds: 0,
      });
      scheduleDTO.category = response.asset?.category as AssetCategoryDTO[];
      for (let related of response.asset?.related) {
        if (related) {
          if (Array.isArray(related.media)) {
            for (let media of related.media) {
              if (media?.rendition?.default?.href) {
                isAssetImageAvailable = true;
                scheduleDTO.image = media.rendition?.default?.href;
                break;
              }
            }
          } else {
            if (related.media?.rendition?.default?.href) {
              isAssetImageAvailable = true;
              scheduleDTO.image = related.media?.rendition?.default?.href;
            }
          }
        }
        if (!isAssetImageAvailable) {
          // Assign N/A image to this asset
          scheduleDTO.image = this.configurationService.get<string>(
            'NOT_AVAILABLE_ASSET_IMAGE_URL',
          );
          isAssetImageAvailable = true;
          break;
        }
      }
      isAssetImageAvailable = false;
      scheduleDTO.summary = response.asset?.summary;
      scheduleDTO.channelLogo = channel.logo;
      scheduleDTO.channelTitle = channel.title;
      scheduleDTOs.push(scheduleDTO);
    }
    return scheduleDTOs;
  }

  /**
   * This method is responsible to Store Channel and Schedule's data in mongoDB.
   * @params assetSchedules this will be the mapped asset schedules from the API and will be inserted into our DB for further processing.
   */
  private async storeSchedulesInDB(assetSchedules: AssetScheduleDTO[]) {
    return await this.scheduleService.CreateSchedule(assetSchedules);
  }
}
