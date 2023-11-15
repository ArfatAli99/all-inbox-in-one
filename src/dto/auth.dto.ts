import { IsNumber, IsString } from 'class-validator';
// import { AxiosResponse } from 'axios';

export class GAuthDTO    {
    
    @IsString()
    access_token?: string;

    @IsNumber()
    expires_in?: number;

    @IsString()
    scope?: string;

    @IsString()
    token_type?: string;

}
