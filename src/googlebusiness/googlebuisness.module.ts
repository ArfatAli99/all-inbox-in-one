import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GoogleBusinessController } from './googlebuisness.controller';
import { GoogleBusinessService } from './googlebuisness.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RdConfigService } from 'src/services/rd_config/rd_config.service';
import { CommonServices } from 'src/services/common.services';
import { Config, ConfigSchema } from 'src/database/schemas/rd_config.schema';

@Module({
  imports: [HttpModule, MongooseModule.forFeature([
    { name: Config.name, schema: ConfigSchema },
  ])],
  controllers: [GoogleBusinessController],
  providers: [GoogleBusinessService,RdConfigService,CommonServices],
  exports: [GoogleBusinessService,RdConfigService,CommonServices],
})
export class GoogleBusinessModule { }
