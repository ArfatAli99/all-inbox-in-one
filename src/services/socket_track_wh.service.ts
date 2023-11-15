import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SocketTrackWH,socketTrackWHDocument } from "src/database/schemas/socket_track.schema";

@Injectable()
export class SocketTrackService {
    constructor(
        @InjectModel(SocketTrackWH.name) private readonly sockettrackModel: Model<socketTrackWHDocument>
    ) { }

    async readAll(param): Promise<SocketTrackWH[]> {
        return await this.sockettrackModel.find(param).exec();
    }

}
