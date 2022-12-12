import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Schedule, ScheduleDocument } from '@Entities/schedule.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class ScheduleRepository extends BaseRepository<ScheduleDocument> {
  constructor(
    @InjectModel(Schedule.name)
    private model: Model<Schedule>,
  ) {
    super(model);
  }

  /**
* This method is responsible for fetching asset details from schedule repo
* @param assetId currently selected asset Id
* @returns it will return the schedule details against the asset
*/
  public async GetAssetSchedule(query: any): Promise<ScheduleDocument> {
    let result = await this.getOneByFilter(query);
    return result;
  }
}
