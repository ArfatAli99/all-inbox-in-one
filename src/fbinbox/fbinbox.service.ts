import { HttpException, HttpStatus, Injectable, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, firstValueFrom, map, Observable } from 'rxjs';
import { CommonServices } from 'src/services/common.services';

// import request = require('request');
@Injectable()
export class FbinboxService {
    constructor(
        private readonly httpService: HttpService,
        private readonly commonService: CommonServices
    ) { }

    async getallPageMessages(userInfo, pageStart, perPage) {

        try {
            let threads = await lastValueFrom(
                this.httpService.get(`https://graph.facebook.com/v14.0/${userInfo.fb_page_id}/conversations`, { params: { access_token: userInfo.page_access_token, offset : pageStart, limit: perPage, fields: 'id,name,unread_count,snippet,updated_time,participants,messages{message,to,from,created_time,id,thread_id,attachments}' } }).pipe(

                // this.httpService.get(`https://graph.facebook.com/v14.0/${userInfo.fb_page_id}/conversations`, { params: { access_token: userInfo.page_access_token, limit: 10, fields: 'id,name,messages{message,message_reads,id,thread_id,from,to,attachments{id,name},created_time,is_unsupported,sticker,story},is_subscribed,message_count,subject,updated_time,senders,unread_count,snippet,scoped_thread_key,participants,wallpaper,link,former_participants,can_reply' } }).pipe(
                    map(resp => resp.data)
                )
            );
            return threads.data.map(thread => ({ ...thread, sorting_time: Date.parse(thread.updated_time), updated_time: thread.updated_time, appType: 'Facebook' }))

        } catch (error) {
            console.log("facebook conversation error => ", error);
            return [];
            // throw new HttpException(error, 400);

        }

    }



    async getAuthUrl(sub_id) {
        const Client_ID = process.env.Client_ID;
        const Redirect_Uri = process.env.Redirect_Uri;
        let redirectUrl = `https://www.facebook.com/v14.0/dialog/oauth?client_id=${Client_ID}&redirect_uri=${Redirect_Uri}&state=${sub_id}&scope=pages_show_list,public_profile,email&auth_type=rerequest`;
        console.log("redirectUrl from getAuthUrl=================", redirectUrl);
        return redirectUrl;

    }

    async getAccessCodes(fb_code, state, res) {
        console.log("Im in the getLongLivedAccessCodes function 2");
        const Client_ID = process.env.Client_ID;
        const Client_Secret = process.env.Client_Secret;
        const Redirect_Uri = process.env.Redirect_Uri;
        let rd_state = state
        try {
            return lastValueFrom(
                this.httpService.get(`https://graph.facebook.com/v14.0/oauth/access_token`, { params: { client_id: Client_ID, redirect_uri: Redirect_Uri, client_secret: Client_Secret, code: fb_code } }).pipe(
                    map(resp => resp.data)
                )
            );

        } catch (error) {
            console.log("error=getAccessCodes========", error);
        }
        // res.status(HttpStatus.OK).redirect(redirectUrl);
    }

    async getLongLivedAccessCodes(access_token) {
        console.log("Im in the getLongLivedAccessCodes function 1");
        const Client_ID = process.env.Client_ID;
        const Client_Secret = process.env.Client_Secret;

        try {
            return lastValueFrom(
                this.httpService.get(`https://graph.facebook.com/oauth/access_token`, { params: { grant_type: "fb_exchange_token", client_id: Client_ID, client_secret: Client_Secret, fb_exchange_token: access_token } }).pipe(
                    map(resp => resp.data)
                )
            );

        } catch (error) {
            console.log("error=getAccessCodes========", error);
        }
        // res.status(HttpStatus.OK).redirect(redirectUrl);
    }

    async getFbUserObj(access_token) {
        console.log("Im in the get getUserObj function");
        try {
            return lastValueFrom(
                this.httpService.get(`https://graph.facebook.com/me`, { params: { access_token: access_token } }).pipe(
                    map(resp => resp.data)
                )
            );

        } catch (error) {
            console.log("error=getUserObj========", error);
        }
    }

    async getPageID(user_id, access_token) {
        console.log("Im in the  getPageID function");
        try {
            return lastValueFrom(
                this.httpService.get(`https://graph.facebook.com/${user_id}`, { params: { access_token: access_token } }).pipe(
                    map(resp => resp.data)
                )
            );

        } catch (error) {
            console.log("error=getPageID========", error);
        }
    }

    async getPageAccessToken(access_token, user_id) {
        console.log("Im in the  getPageAccessToken function");
        try {
            return lastValueFrom(
                this.httpService.get(`https://graph.facebook.com/${user_id}/accounts`, { params: { access_token: access_token } }).pipe(
                    map(resp => resp.data)
                )
            );

        } catch (error) {
            console.log("error=getPageAccessToken========", error);
        }
    }

    async getAllPageAccessToken(access_token, user_id) {
        console.log("Im in the  getAllPageAccessToken function");
        console.log(access_token, "====", user_id);
        try {
            return lastValueFrom(
                this.httpService.get(`https://graph.facebook.com/${user_id}/accounts`, { params: { access_token: access_token, fields: 'name,access_token' } }).pipe(
                    // this.httpService.get(`https://graph.facebook.com/${user_id}/accounts`, { params: { access_token: access_token } }).pipe(
                    map(resp => resp.data)
                )
            );

        } catch (error) {
            console.log("error=getAllPageAccessToken========", error);
        }
    }

    async getRDversion(getCofigs) {
        console.log("i m in the funct getRDversion");
        const data1 = {
            integration: true,
            app_type: 'connect',
            sub_id: this.commonService.encrypt(getCofigs.sub_id),
            store_id: this.commonService.encrypt(getCofigs.store_id)
        }
        try {
            const saveApp = await lastValueFrom(
                this.httpService.post(`https://api.repaircrm.co/api/web/v2/api/saveappsettings?sub_id=${getCofigs.sub_id}`, data1).pipe(
                    map(resp => resp.data)
                )
            );
            console.log("=======saveApp=======", saveApp);
            const rdVersion = await lastValueFrom(
                this.httpService.post(`https://app.repaircrm.co/index.php?r=temp/CheckUserUI&user_id=${getCofigs.user_id}&sub_id=${getCofigs.sub_id}`).pipe(
                    map(resp => resp.data)
                )
            );
            console.log("=======rdVersion=======", rdVersion);

            return rdVersion;
        } catch (error) {
            console.log("getRDversion  try catch error", error);

        }

    }

    async setSaveAppConfig(getCofigs, integration_bit) {
        console.log("i m in the funct getRDversion");
        const data1 = {
            integration: `${integration_bit}`,
            app_type: 'connect',
            sub_id: this.commonService.encrypt(getCofigs.sub_id),
            store_id: this.commonService.encrypt(getCofigs.store_id)
        }
        try {
            const saveApp = await lastValueFrom(
                this.httpService.post(`https://api.repaircrm.co/api/web/v2/api/saveappsettings?sub_id=${getCofigs.sub_id}`, data1).pipe(
                    map(resp => resp.data)
                )
            );
            console.log("=======saveApp=======", saveApp);
            return saveApp;
        } catch (error) {
            console.log("getRDversion  try catch error", error);

        }

    }

    async getonlyversion(getCofigs) {
        console.log("i m in the funct getonlyversion");
        try {
            const rdVersion = await lastValueFrom(
                this.httpService.post(`https://app.repaircrm.co/index.php?r=temp/CheckUserUI&user_id=${getCofigs.user_id}&sub_id=${getCofigs.sub_id}`).pipe(
                    map(resp => resp.data)
                )
            );
            console.log("=======rdVersion=======", rdVersion);
            return rdVersion;
        } catch (error) {
            console.log("getonlyversion  try catch error", error);

        }

    }
}

