import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ConfigDocument = Config & Document

@Schema()
export class Config {

    @Prop()
    user_id: string;
    @Prop()
    sub_id: string;
    @Prop()
    store_id: string;
    @Prop()
    rd_enabled: boolean;
    @Prop()
    server: string;
    @Prop()
    ttl: string;
    @Prop()
    access_token: string;
    @Prop()
    token_type: string;
    @Prop()
    expires_in: string;
    @Prop()
    connection_id: string;
    @Prop()
    fb_page_id: string;
    @Prop()
    fb_page_name: string;
    @Prop()
    fb_user_id: string;
    @Prop()
    page_access_token: string;
    @Prop()
    user_access_token_expire: Date;
    @Prop()
    facebook_enabled: boolean;
 
    
}

export const ConfigSchema = SchemaFactory.createForClass(Config);


