import { IsString } from 'class-validator';

export class ReplyReviewDTO {

    @IsString()
    Comment?: string;

}
