import { Body, Controller, Req, Get, Request, Query, Response, Post, HttpCode, Res, HttpStatus } from '@nestjs/common';
import { GoogleBusinessService } from './googlebuisness.service';
import { ReplyReviewDTO } from 'src/dto/review.auth';
import { RdConfigService } from '../services/rd_config/rd_config.service';
import { CommonServices } from 'src/services/common.services';

@Controller('gbusiness')
export class GoogleBusinessController {
    constructor(private readonly googlebusinessservice: GoogleBusinessService,
        private readonly configservice: RdConfigService,
        private readonly commonservices: CommonServices,
    ) {
    }

    @Get()
    getHello(): string {
        return "Page is Working";
    }

    @Get('oauth-google')
    async authenticateWithGoogle(@Res() res: any) {
        console.log("=====================authenticateWithGoogle");
        this.googlebusinessservice.getGoogleAuthUrl(res);
    }

    @Get('redirect-from-google')
    async redirectSuccess(@Query('code') code, @Res() res: any) {
        // return code;
        console.log("=====================redirect-from-google");
        console.log("code", code);
        let g_code = code;
        // res.sendStatus(HttpStatus.OK);
        const access_codes = await this.googlebusinessservice.getAccessCodes(g_code, res);
        console.log("access_codes", access_codes)

        // let tmpObj: AcessCodes;
        // tmpObj.access_token = access_codes.access_token;
        // tmpObj.expires_in = access_codes.expires_in;
        // tmpObj.scope = access_codes.scope;
        // tmpObj.token_type = access_codes.token_type;
        // tmpObj.Outh_for = "google";

        // let tmpObj: AcessCodes = {
        //     access_token: access_codes.access_token,
        //     expires_in: access_codes.expires_in,
        //     scope: access_codes.scope,
        //     token_type: access_codes.token_type,
        //     Outh_for: "google",
        //     datetime: new Date().toString(),
        // }

        // console.log("-------------------------tmpObj", tmpObj);
        // const newAccessCodes = await this.accesscodesservice.create(tmpObj);
        // return res.status(HttpStatus.CREATED).json({
        //     newAccessCodes
        // })
        // console.log(access_codes);
    }


    @Get('get-all-review')
    async Reviews(@Res() res: any) {
        // const newAccessCodes = await this.accesscodesservice.readByOuthType();
        // const old_date = newAccessCodes.datetime;
        // const new_date = new Date(old_date);
        // console.log("type of",typeof newAccessCodes.datetime);
        // var dif = (new_date.getTime() - old_date.getTime()) / 1000;
        // console.log("dif",dif);

        return res.status(HttpStatus.OK).json({
            // newAccessCodes
        })

    }
    @Get('submit-a-reply')
    async sendReviewsReply(replyreview: ReplyReviewDTO, @Res() res: any) {
        const newAccessCodes = await this.googlebusinessservice.replyToaReview(res, replyreview);

        return res.status(HttpStatus.OK).json({
            newAccessCodes
        })

    }




}
