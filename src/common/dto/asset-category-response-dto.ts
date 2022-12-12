import { AutoMap } from '@automapper/classes';

export class AssetCategoryListResponseDTO {
  @AutoMap()
  title: string;
  @AutoMap()
  category: string;
 
}
