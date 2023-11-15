import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type socketTrackWHDocument = SocketTrackWH & Document

@Schema()
export class SocketTrackWH {

    @Prop()
    sub_id: string;
    @Prop()
    store_id: string;
    @Prop()
    app_type: string;
    @Prop()
    connectionId: string;
        
}

export const socketTrackWHSchema = SchemaFactory.createForClass(SocketTrackWH);

