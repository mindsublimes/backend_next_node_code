import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/types';
import { ProgramRatingRequestDTO } from '@DTO/program-rating-request.dto';
import ResponseHelper from '@Helper/response-helper';
import { Rating } from '@Entities/rating.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RatingRepository } from '@Repository/rating.repository';
import ApiResponse from '@Helper/api-response';
import { BaseDTO } from '@DTO/base.dto';
import { ProgramRatingResponseCountDTO } from '@DTO/program-rating-count-response.dto';
@Injectable()
export default class RatingService {
  /**
   *  This service is used for handling operations related to Rating collection.
   */
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly ratingRepository: RatingRepository,
  ) {}

  /**
   * This method is responsible for fetching 'average' & 'total' rating.
   * @param pId currently selected asset Id
   * @returns it will returns the total rating against the program and average rating
   */
  public async getTotalAndAverageRatingByProgram(
    assetId: string,
  ): Promise<ApiResponse<ProgramRatingResponseCountDTO>> {
    let result = await this.ratingRepository.getRating([
      {
        $match: {
          assetId: assetId,
        },
      },
      {
        $group: {
          _id: '$assetId',
          totalRating: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
    ]);
    if (result?.length) {
      return ResponseHelper.CreateResponse<ProgramRatingResponseCountDTO>(
        {
          TotalRating: result[0].totalRating,
          AverageRating: result[0].averageRating,
        },
        HttpStatus.OK,
      );
    } else {
      return ResponseHelper.CreateResponse<ProgramRatingResponseCountDTO>(
        {
          TotalRating: 0,
          AverageRating: 0,
        },
        HttpStatus.OK,
      );
    }
  }

  async createRating(
    rate: ProgramRatingRequestDTO,
  ): Promise<ApiResponse<BaseDTO>> {
    try {
      let rating = this.mapper.map(rate, Rating, ProgramRatingRequestDTO);
      let result = await this.ratingRepository.create(rating);
      return ResponseHelper.CreateResponse<BaseDTO>(result, HttpStatus.CREATED);
    } catch (e: any) {
      console.log(e);
    }
  }

  /**
   *
   * @param userId currently logged-in user Id
   * @param assetId currently selected assetId
   * @returns It will return true/false if current user has already rated on this program or not
   */
  async checkRating(
    userId: string,
    assetId: string,
  ): Promise<ApiResponse<boolean>> {
    try {
      let result = await this.ratingRepository.getOneByFilter({
        userId: userId,
        assetId: assetId,
      });
      if (result._id) {
        return ResponseHelper.CreateResponse<boolean>(true, HttpStatus.OK);
      }
      return ResponseHelper.CreateResponse<boolean>(false, HttpStatus.OK);
    } catch (e: any) {
      return ResponseHelper.CreateResponse<boolean>(
        false,
        HttpStatus.NOT_FOUND,
      );
      console.log(e);
    }
  }
}
