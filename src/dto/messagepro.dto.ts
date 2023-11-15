import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LogsPhonePro {

    @IsNumber()
    @IsNotEmpty()
    pagesize?: number;

    @IsNumber()
    @IsNotEmpty()
    page?: number;

    @IsString()
    @IsNotEmpty()
    cookie_?: string;

}
