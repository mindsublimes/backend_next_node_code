import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Region, RegionDocument } from '@Entities/region.entity';
import { BaseRepository } from './base.repository';

@Injectable()
export class RegionRepository extends BaseRepository<RegionDocument> {
    constructor(
        @InjectModel(Region.name)
        private model: Model<Region>,
    ) {
        super(model);
    }
}
