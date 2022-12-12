import { Module } from '@nestjs/common';
import { UserController } from '@Controllers/user.controller';
import { RatingController } from '@Controllers/rating.controller';
import { PressAssociationController } from '@Controllers/press-association.controller';

import { ScheduleService } from '@Services/schedule.service';
import { PressAssociationService } from '@Services/press-association.service';
import { UserService } from '@Services/user.service';
import RatingService from '@Services/rating.service';
import { GlobalConfigurationService } from '@Services/global-configuration.service';
import { ChannelService } from '@Services/channel.service';

import { RatingRepository } from '@Repository/rating.repository';
import { ScheduleRepository } from '@Repository/schedule.repository';
import { UserRepository } from '@Repository/user.repository';
import { GlobalConfigurationRepository } from '@Repository/global-configuration.repository';
import { ChannelRepository } from '@Repository/channel.repository';

import { Rating, RatingSchema } from '@Entities/rating.entity';
import { User, UserSchema } from '@Entities/user.entity';
import { Schedule, ScheduleSchema } from '@Entities/schedule.entity';
import {
  GlobalConfiguration,
  GlobalConfigurationSchema,
} from '@Entities/global-configuration.entity';
import { Channel, ChannelSchema } from '@Entities/channel.entity';

import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RatingProfile } from '@Profiles/rating.profile';
import { UserProfile } from '@Profiles/user.profile';

import { ScheduleProfile } from '@Profiles/schedule.profile';
import { GlobalConfigurationProfile } from '@Profiles/global-configuration.profile';
import { PlatformController } from '@Controllers/platform.controller';
import { ScheduleController } from '@Controllers/schedule.controller';
import { AssetController } from '@Controllers/asset.contoller';
import { AssetService } from '@Services/asset.service';

import { PlatformProfile } from '@Profiles/platform.profile';
import PlatformService from '@Services/platform.service';
import { PlatformRepository } from '@Repository/platform.repository';
import { Platform, PlatformSchema } from '@Entities/platform.entity';
import { AssetCategoryProfile } from '@Profiles/asset-category.profile';
import AssetCategoryService from '@Services/asset-category.service';
import { AssetCategoryRepository } from '@Repository/asset-category.repository';
import {
  AssetCategory,
  AssetCategorySchema,
} from '@Entities/asset-category.entity';
import { AssetCategoryController } from '@Controllers/asset-category.controller';
import { AssetScheduleProfile } from '@Profiles/asset-schedule-profile';
import { RegionService } from '@Services/region.service';
import { RegionController } from '@Controllers/region.controller';
import { RegionRepository } from '@Repository/region.repository';
import { RegionProfile } from '@Profiles/region.profile';
import { Region, RegionSchema } from '@Entities/region.entity';
import AxiosHelper from '@Helper/axios.helper';
import { ElasticSearchService } from '@Services/elastic-search.service';
import { ChannelProfile } from '@Profiles/channel.profile';
import { AssetProfile } from '@Profiles/asset.profile';
import { UserChannelService } from '@Services/user-channel.service';
import { MyChannelProfile } from '@Profiles/my-channel-profile';
import { ChannelController } from '@Controllers/channel.controller';
import { UserChannelController } from '@Controllers/user-channel.controller';
import { UserChannelRepository } from '@Repository/user-channel.repository';
import { MyChannel, MyChannelSchema } from '@Entities/my-channels.entity';
@Module({
  controllers: [
    UserController,
    RatingController,
    PressAssociationController,
    AssetController,
    ScheduleController,
    PlatformController,
    AssetCategoryController,
    ChannelController,
    UserChannelController,
    RegionController,
  ],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_SERVER_URL'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Rating.name, schema: RatingSchema }]),

    MongooseModule.forFeature([
      { name: Schedule.name, schema: ScheduleSchema },
    ]),
    MongooseModule.forFeature([
      { name: GlobalConfiguration.name, schema: GlobalConfigurationSchema },
    ]),
    MongooseModule.forFeature([{ name: Channel.name, schema: ChannelSchema }]),
    MongooseModule.forFeature([
      { name: Platform.name, schema: PlatformSchema },
    ]),
    MongooseModule.forFeature([
      { name: AssetCategory.name, schema: AssetCategorySchema },
    ]),
    MongooseModule.forFeature([{ name: Region.name, schema: RegionSchema }]),
    MongooseModule.forFeature([
      { name: MyChannel.name, schema: MyChannelSchema },
    ]),
  ],
  providers: [
    RegionService,
    RatingProfile,
    UserChannelService,
    MyChannelProfile,
    UserProfile,
    RegionProfile,
    UserService,
    UserRepository,
    AssetService,
    RatingService,
    RatingRepository,
    PressAssociationService,
    ScheduleProfile,
    ScheduleService,
    ScheduleRepository,
    AssetService,
    GlobalConfigurationProfile,
    GlobalConfigurationService,
    GlobalConfigurationRepository,
    RegionRepository,
    ChannelService,
    ChannelRepository,
    PlatformProfile,
    PlatformService,
    PlatformRepository,
    AssetCategoryProfile,
    AssetCategoryService,
    AssetCategoryRepository,
    RegionProfile,
    ChannelProfile,
    AssetScheduleProfile,
    AxiosHelper,
    ElasticSearchService,
    ChannelProfile,
    AssetProfile,
    UserChannelRepository,
    RegionRepository,
  ],
})
export class AppModule {}
