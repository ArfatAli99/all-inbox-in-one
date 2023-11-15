import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FbinboxController } from './fbinbox.controller';
import { FbinboxService } from './fbinbox.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RdConfigService } from 'src/services/rd_config/rd_config.service';
import { Config, ConfigSchema } from 'src/database/schemas/rd_config.schema';
import { CommonServices } from 'src/services/common.services';
import { MessageproService } from 'src/messagepro/messagepro.service';
import { SocketTrackService } from '../services/socket_track_wh.service';
import { SocketTrackWH, socketTrackWHSchema } from 'src/database/schemas/socket_track.schema';

@Module({
    imports: [HttpModule , MongooseModule.forFeature([
      { name: Config.name, schema: ConfigSchema },
      { name: SocketTrackWH.name, schema: socketTrackWHSchema }

    ])],
    controllers: [FbinboxController],
    providers: [FbinboxService,RdConfigService,CommonServices,MessageproService, SocketTrackService],
    exports: [FbinboxService,RdConfigService,CommonServices,MessageproService],
  })
  export class FbinboxModule { }
