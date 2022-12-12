import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosResponse } from 'axios';
import Constants from './constants';
import { RequestType } from './request-type.enum';
/**
 * This Helper Class is responsible to wrap axios functionality and expose only needed methods.
 */

@Injectable()
export default class AxiosHelper {
  private endPoint: string = '';

  constructor(private configurationService: ConfigService) {}

  public async get<T>(
    requestConfig: {
      endpoint: string;
      requestType?: RequestType;
    },
    config?: any,
  ): Promise<T> {
    this.endPoint = requestConfig.endpoint;
    if (!requestConfig.requestType) {
      requestConfig.requestType = RequestType.PressAssociationRequest;
    }
    //Setting the base url based on the request
    this.setBaseUrl(requestConfig.requestType);

    return new Promise((resolve, reject) => {
      axios
        .get<T>(this.endPoint, config)
        .then((value: AxiosResponse<T>) => {
          resolve(value.data);
        })
        .catch((error: AxiosError) => {
          console.log(error);
          // TODO: This has to be done... Ahmed
          reject(error);
        });
    });
  }

  private setBaseUrl(requestType?: RequestType) {
    if (requestType === RequestType.PressAssociationRequest) {
      axios.defaults.baseURL = Constants.PRESS_ASSOCIATION_API_BASE_URL;
      axios.defaults.headers['apiKey'] =
        this.configurationService.get<string>('API_KEY');
    } else {
      axios.defaults.baseURL = this.configurationService.get<string>(
        'ELASTIC_SEARCH_SERVER_URL',
      );
      const url = this.configurationService.get<string>(
        'ELASTIC_SEARCH_SERVER_URL',
      );
    }
    axios.defaults.headers['accept'] = 'application/json';
  }
}
