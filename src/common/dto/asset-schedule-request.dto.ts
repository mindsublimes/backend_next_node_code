import { Transform, Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator';

export class AssetScheduleRequestDTO {
  @IsNotEmpty()
  platformId: string;
  @IsOptional()
  category: string;
  @IsNotEmpty()
  selectedStartDateTime: string;
  @IsNotEmpty()
  selectedEndDateTime: string;
}
