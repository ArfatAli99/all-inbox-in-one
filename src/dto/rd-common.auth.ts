import { IsBoolean, IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EnableRdInbox {

    @IsString()
    cookie_?: string;

    @IsBoolean()
    @IsNotEmpty()
    @IsDefined()
    enableBit?: boolean;

}
export class IsEnableRdInbox {

    @IsString()
    @IsNotEmpty()
    cookie_: string;
}
export class Cookie {

    @IsString()
    @IsNotEmpty()
    cookie_?: string;

}
export class SaveFBPageInfo {

    @IsString()
    @IsNotEmpty()
    access_token?: string;

    @IsString()
    @IsNotEmpty()
    fb_page_id?: string;

    @IsString()
    @IsNotEmpty()
    fb_page_name?: string;

    @IsString()
    @IsNotEmpty()
    cookie_?: string;

}

export class ConversationDto {

    @IsString()
    @IsNotEmpty()
    cookie_?: string;

    @IsNumber()
    @IsNotEmpty()
    page?: number;

}