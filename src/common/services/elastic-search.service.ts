import { ChannelResponseDTO } from '@DTO/channel-response.dto';
import ApiResponse from '@Helper/api-response';
import AxiosHelper from '@Helper/axios.helper';
import { ElasticSearchAPIResponse } from '@Helper/elastic-search-api-response';
import Hits from '@Helper/hits.response';
import { RequestType } from '@Helper/request-type.enum';
import ResponseHelper from '@Helper/response-helper';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';

/**
 * This Service is responsible to manage data from Elastic Search.
 */
@Injectable()
export class ElasticSearchService {
  constructor(private axios: AxiosHelper) {}

  /**
   * This method is used to query elastic search and before sending actual response removing extra fields
   * i.e _source _document etc from response.
   * @param filterPath It is the actual query/endpoint for which we will be using for querying elastic search.
   * @param filter It is the object which will be passed to that endpoint to create 'filter' in elastic search format.
   * @returns type of data which we have passed when we call this method.
   */
  public async FetchData<T>(
    filterPath: string,
    filter: any,
  ): Promise<ApiResponse<T[]>> {
    const req = await this.axios.get<ElasticSearchAPIResponse<T>>(
      {
        endpoint: filterPath,
        requestType: RequestType.ElasticSearchRequest,
      },
      {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        params: {
          source: JSON.stringify(filter),
          source_content_type: 'application/json',
        },
      },
    );
    let response: T[] = [];
    if (req.hits?.hits.length) {
      const res = req.hits?.hits as any;
      for (let data of res) {
        response.push(data._source.document);
      }
    }
    return ResponseHelper.CreateResponse(response, HttpStatus.OK);
  }
}
