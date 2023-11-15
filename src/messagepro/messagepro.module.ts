import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CommonServices } from 'src/services/common.services';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageproController } from './messagepro.controller';
import { MessageproService } from './messagepro.service';
import { RdConfigService } from 'src/services/rd_config/rd_config.service';
import { SocketTrackService } from '../services/socket_track_wh.service';
import { Config, ConfigSchema } from 'src/database/schemas/rd_config.schema';
import { SocketTrackWH, socketTrackWHSchema } from 'src/database/schemas/socket_track.schema';



@Module({
  imports: [HttpModule , MongooseModule.forFeature([
    { name: Config.name, schema: ConfigSchema },
    { name: SocketTrackWH.name, schema: socketTrackWHSchema }
  ])],
  controllers: [MessageproController],
  providers: [CommonServices, MessageproService, RdConfigService, SocketTrackService]
})
export class MessageproModule {}
