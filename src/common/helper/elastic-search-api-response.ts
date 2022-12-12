import Hits from './hits.response';

export class ElasticSearchAPIResponse<T> {
  public hits: Hits<T>;
}
