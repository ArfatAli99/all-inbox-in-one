import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type TemplateDocument = Template & Document

@Schema()
export class Template {
    
    @Prop()
    user_id: string;
    @Prop()
    sub_id: string;
    @Prop()
    store_id: string;
    @Prop()
    coversation_id: string;
    @Prop()
    conversation_type: string;

}

export const TemplateSchema = SchemaFactory.createForClass(Template);


