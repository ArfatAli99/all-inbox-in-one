import {IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class TemplateDTO{

    @IsString()
    @IsNotEmpty()
    user_id?: string;

}
export class CreateTemplateDTO{

    @IsString()
    @IsNotEmpty()
    user_id?: string;

    @IsString()
    @IsNotEmpty()
    sub_id?: string;

    @IsString()
    @IsNotEmpty()
    store_id?: string;

    @IsString()
    @IsNotEmpty()
    coversation_id?: string;

    @IsString()
    @IsNotEmpty()
    conversation_type?: string;

}
