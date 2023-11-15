import { HttpStatus, Injectable, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, firstValueFrom, map, Observable } from 'rxjs';
import { GAuthDTO } from '../dto/auth.dto';
import { ReplyReviewDTO } from 'src/dto/review.auth';


@Injectable()
export class GoogleBusinessService {

    constructor(
        private readonly httpService: HttpService,
    ) { }

    async getGoogleAuthUrl(res) {

        const Client_ID = process.env.GOOGLE_CLIENT_ID;
        const google_redirect_uri = process.env.GOOGLE_REDIRECT_URI;
        const response_type = 'code';
        const scope = 'https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fbusiness.manage';
        let redirectUrl = `https://accounts.google.com/o/oauth2/auth?response_type=${response_type}&client_id=${Client_ID}&scope=${scope}&redirect_uri=${google_redirect_uri}`;
        res.redirect(redirectUrl);
        console.log('===========redirectUrl', redirectUrl);
        return;

    }
    async getAccessCodes(g_code, res): Promise<GAuthDTO> {

        const Client_ID = process.env.GOOGLE_CLIENT_ID;
        const Client_Secret = process.env.GOOGLE_CLIENT_SECRET;
        const Redirect_Uri = process.env.GOOGLE_REDIRECT_URI;

        try {
            const data1 = {
                grant_type: "authorization_code",
                code: g_code,
                redirect_uri: Redirect_Uri,
                client_id: Client_ID,
                client_secret: Client_Secret
            }
            // return await lastValueFrom(this.httpService.post(`https://oauth2.googleapis.com/token`, data1) );

            const data = await lastValueFrom(
                this.httpService.post(`https://oauth2.googleapis.com/token`, data1).pipe(
                    map(resp => resp.data)
                )
            );

            return data;

            // {
            //     "access_token": "ya29.a0ARrdaM91sSKZtUIyjwsRIgvTNLW6qu2OY4pfK6CIt3pfgB2L3e4jUZe8MdP98U1p0ydexxxOfTnM7Bf8wxq3AsPYIqSZGSuhLRrT0PKqOIyyjgL_aRszzUV7XuDTYnTONeKF-ok5zL0Rn09z3XdsOwBfCqC57g",
            //     "expires_in": 3599,
            //     "scope": "https://www.googleapis.com/auth/business.manage",
            //     "token_type": "Bearer"
            //   }


        } catch (error) {
            console.log("error=========", error);
        }


        // res.status(HttpStatus.OK).redirect(redirectUrl);

    }
    // public async create(
    //     createAuthDto: CreateAuthDto,
    // ): Promise<Auth> {
    //     const newAuth = await new this.authModel(createAuthDto);
    //     return newAuth.save();
    // }

    async getListallreviews(res) {

        try {

            let acc_id = '';
            let loc_id = '';
            const data = await lastValueFrom(
                this.httpService.post(`https://mybusiness.googleapis.com/v4/accounts/${acc_id}/locations/${loc_id}/reviews`).pipe(
                    map(resp => resp.data)
                )
            );

            return data;



        } catch (error) {
            console.log("error=========", error);
        }


        // res.status(HttpStatus.OK).redirect(redirectUrl);

    }

    async replyToaReview(res, comment_) {

        try {

            let accountId = '';
            let locationId = '';
            let reviewId = '';

            const data = await lastValueFrom(
                this.httpService.post(`https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews/${reviewId}/reply`, {
                    comment: comment_
                }).pipe(
                    map(resp => resp.data)
                )
            );

            return data;



        } catch (error) {
            console.log("error=========", error);
        }


        // res.status(HttpStatus.OK).redirect(redirectUrl);

    }

    async enabledRdInbox(decodedCookie) {
        let store_id = decodedCookie.store_id;
        let uid = decodedCookie.uid
        let sub_id = decodedCookie.sub_id

        
        // this.rd



    }


}

