import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rating, RatingDocument } from '@Entities/rating.entity';
import { BaseRepository } from './base.repository';
import { ProgramRatingResponseCountDTO } from '@DTO/program-rating-count-response.dto';

@Injectable()
export class RatingRepository extends BaseRepository<RatingDocument> {
  constructor(
    @InjectModel(Rating.name)
    private model: Model<Rating>,
  ) {
    super(model);
  }

  //   /**
  //    * This method will mark rating based on userId & programId
  //    * @Params rating, this is rating entity which will create rating against particular userId & programId
  //    * @returns this will return success after marking program's rating.
  //    */
  //   public async rateAProgram(rating: Rating): Promise<Rating> {
  //     let result = await this.create(rating);
  //     return result;
  //   }

  /**
   * This method will get rating based on userId & programId
   * @Params rating, this is rating entity which will create rating against particular userId & programId
   * @returns this will return Total Rating of a Program And Average Rating of a Program.
   */
  public async getRating(query: any): Promise<any[]> {
    let result = await this.getAggregation(query);
    return result;
  }
}
