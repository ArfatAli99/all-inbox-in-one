import { Body, Controller, Req, Get, Request, Query, Response, Post, HttpCode, Res, HttpStatus, HttpException } from '@nestjs/common';
import { EnableRdInbox, Cookie, SaveFBPageInfo, ConversationDto } from 'src/dto/rd-common.auth';
import { FbinboxService } from './fbinbox.service';
import { RdConfigService } from 'src/services/rd_config/rd_config.service';
import { CommonServices } from 'src/services/common.services';
import { MessageproService } from 'src/messagepro/messagepro.service';
import { SocketTrackService } from 'src/services/socket_track_wh.service';

@Controller('fbinbox')
export class FbinboxController {
    constructor
        (
            private readonly fbinboxservice: FbinboxService,
            private readonly messageproservice: MessageproService,
            private readonly config: RdConfigService,
            private readonly commonService: CommonServices,
            private readonly socketTrackWH: SocketTrackService
    ) { }

    @Get('webhook')
    verifyWebhook(@Body() rawbody: any, @Response() res: any, @Query('hub.mode') mode, @Query('hub.verify_token') token, @Query('hub.challenge') challenge) {
        // Your verify token. Should be a random string.
        const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
        console.log("request received", VERIFY_TOKEN);
        // Parse the query params
        // let mode = req.query['hub.mode'];
        // let token = req.query['hub.verify_token'];
        // let challenge = req.query['hub.challenge'];
        console.log(mode, token, challenge, VERIFY_TOKEN);
        // Checks if a token and mode is in the query string of the request
        if (mode && token) {

            // Checks the mode and token sent is correct
            // if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            if (mode === 'subscribe') {

                // Responds with the challenge token from the request
                console.log('WEBHOOK_VERIFIED');
                res.status(200).send(challenge);

            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                res.sendStatus(403);
            }
        }


    }

    @Post('webhook')
    async runWebhook(@Body() rawbody: any, @Response() res: any) {
        console.log(rawbody, "====webhook====");
        console.log("........rawbody......==", JSON.stringify(rawbody), "......rawbody end........==");
        let body = rawbody;
        // Checks if this is an event from a page subscription
        if (body.object === 'page') {
            // Iterates over each entry - there may be multiple if batched
            const $this = this
            console.log("..............==", JSON.stringify(body.entry), "..............==");
            for (const entry of body.entry) {
                // Gets the body of the webhook event
                const webhookEvent = entry.messaging[0];
                console.log(webhookEvent);
                // Get the sender PSID
                const senderPsid = webhookEvent.sender.id;
                const recipient_Id = webhookEvent.recipient.id;
                console.log('Sender PSID: ' + senderPsid);
                console.log('recipient_Id: ' + recipient_Id);
                // code for webhook
                try {
                    const user_info = await $this.config.getUserInfoByPageID(recipient_Id);
                    console.log("user_info=>", user_info)
                    if (user_info) {
                    
                        const saveLogs = await this.commonService.sendAxioPostReq(`https://api.repaircrm.co/api/web/v2/api/saveinboxlogs?sub_id=${user_info.sub_id}`, {
                            "sub_id": this.commonService.encrypt(user_info.sub_id),
                            "notes_subject": "Facebook Message",
                            "body": webhookEvent.message.text,
                            "admin_id": user_info.user_id,
                            "record_type": "facebook"
                        });
                        console.log("=======saveLogs=======", saveLogs);

                        const socketConnections = await this.socketTrackWH.readAll({sub_id: user_info.sub_id, store_id: user_info.store_id });
                        console.log("socketConnections =>", socketConnections)
                        if (socketConnections.length > 0) {
                            
                            const messages = await this.commonService.sendAxioGetReq(`https://graph.facebook.com/v14.0/${user_info.fb_page_id}/conversations?fields=id,unread_count,snippet,updated_time,participants,messages{message,to,from,created_time,id,thread_id,attachments}&user_id=${senderPsid}&access_token=${user_info.page_access_token}`, {})
                            console.log("messages => ", messages)
                            const thread = messages.data[0];
                            
                            // const fbUserInfo = await this.commonService.sendAxioGetReq(`https://graph.facebook.com/${senderPsid}?access_token=${user_info.page_access_token}`, {})
                            
                            // const msgSenders = await this.commonService.sendAxioGetReq(`https://graph.facebook.com/v14.0/${user_info.fb_page_id}/conversations?fields=senders&user_id=${senderPsid}&access_token=${user_info.page_access_token}`, {})
                            
                            // webhookEvent.threadName = `${fbUser.first_name} ${fbUser.last_name}`;

                            thread.appType = 'Facebook';
                            console.log("thread => ", thread);
                            /* for (const connection of socketConnections) {
                            
                                await this.commonService.sendMessageToWebhook(connection.connectionId, thread);
                            } */

                        }
                    }
                } catch (err) {
                    console.log("catch error =>", err)
                }
                // code for webhook end
            }
            // Returns a '200 OK' response to all requests
            res.status(200).send('EVENT_RECEIVED');
        } else {
            console.log('here in 404')
            // Returns a '404 Not Found' if event is not from a page subscription
            res.status(404).json({ message: "nothing found" });
        }
    }


    @Post('get-page-conversations')
    async getAllPreviousMessages(@Body() conversationDto: ConversationDto, @Response() res: any) {
        console.log("i am in the conversations");
        try {

            // conversationDto.page = parseInt(conversationDto.page);
            conversationDto.page = conversationDto.page > 1 ? conversationDto.page : 1; 
            const perPage = 8;
            const pageOffset = perPage * (conversationDto.page - 1);

            console.log("conversationDto =>", conversationDto)
            let dycrpted = this.commonService.decrypt(conversationDto.cookie_);
            if (dycrpted) {
                console.log(dycrpted, "ddddddddddddd");
                let user_info = await this.config.readByUserID({ user_id: dycrpted.uid });
                // let user_info = await this.config.getPageID({ user_id: dycrpted.uid });
                console.log(user_info, "dddddduser_infoddddddd");

                if (user_info) {
                    let combineChats = [];
                    console.log("i am in the user_info");
                    combineChats = await this.messageproservice.getPhoneProConversations(dycrpted, conversationDto);
                    
                    if (user_info.fb_page_id) {
                        console.log("phoneProConversations => ", combineChats);
                        
                        // const fb_messages = await this.fbinboxservice.getallPageMessages(user_info);
                        let fbConversations = await this.fbinboxservice.getallPageMessages(user_info, pageOffset, perPage);

                        combineChats = [...combineChats, ...fbConversations];
                        combineChats.sort((a, b) => a.sorting_time - b.sorting_time).reverse();
                        
                    } else {

                        return res.status(HttpStatus.BAD_REQUEST).json({
                            "error": true,
                            "message": "Facebook Page id is not valid."
                        });
                    }
                    return res.status(HttpStatus.OK).json({
                        success: "Messages Fetched Successfully",
                        count: combineChats.length,
                        data: combineChats
                    })

                } else {
                    res.status(HttpStatus.BAD_REQUEST).json({
                        "error": true,
                        "message": "User Not Found."
                    })

                }

            } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                    "error": true,
                    "message": "cookie is not valid."
                })

            }
        } catch (error) {
            throw new HttpException(error, 400);

        }
    }

    @Post('outh-facebook')
    async authenticateWithFacebook(@Res() res: any, @Body() cookieParam: Cookie) {
        try {
            console.log("outh facebook working");
            let cookee = cookieParam.cookie_;
            let dycrpted = this.commonService.decrypt(cookee);
            if (dycrpted) {
                let url = await this.fbinboxservice.getAuthUrl(dycrpted.sub_id);
                console.log("URL++++++++=", url);
                if (url) {
                    return res.status(HttpStatus.OK).json({
                        "connected": true,
                        "data": url
                    })
                } else {
                    console.log("URL+++++else+++=", url);
                    res.status(HttpStatus.BAD_REQUEST).json({
                        "error": true,
                        "message": "Auth url is not Valid."
                    })
                }
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                    "error": true,
                    "message": "cookie is not valid."
                })
            }
        } catch (error) {
            throw new HttpException(error, 400);

        }

    }

    @Get('redirect-from-facebook')
    async redirectSuccess(@Req() request: Request, @Query('code') code, @Query('error') errors, @Query('state') state, @Res() res: any) {
        console.log("In request success", request, "In request success ENd");
        console.log("In request errors", errors, "In request errors ENd");
        console.log("In redeirect success 22");
        let fb_code = code;
        let rd_state = state;
        if (errors) {
            let getCofigs = await this.config.findOne({ sub_id: state });
            if (getCofigs) {
                //checking RD version for redirection
                let rdVersion = await this.fbinboxservice.getonlyversion(getCofigs);
                if (rdVersion) {
                    const versionUrl = rdVersion.application_type == '1.0' ? 'config/SquareNew' : 'nux/integration/index#/connect';
                    console.log("server_url---before added-----", versionUrl);
                    let server_url = `https://${getCofigs.server}/index.php?r=${versionUrl}?redirect=false`;
                    console.log("server_url---http added-----", server_url);
                    res.redirect(server_url);
                    return;
                } else {
                    return res.status(HttpStatus.CREATED).json({
                        "error": true,
                        "message": "Version Check API is not responding Properly"

                    });
                }

            } else {
                return res.status(HttpStatus.CREATED).json({
                    "error": true,
                    "message": "User against this sub-id does not exist"

                });

            }
            return;

        }
        if (state) {
            let getCofigs = await this.config.findOne({ sub_id: state });
            if (getCofigs) {
                if (getCofigs.user_access_token_expire) {
                    const date1 = getCofigs.user_access_token_expire;
                    const date2 = new Date();
                    console.log(date1, date2, "these are the dates")
                    let difference = date2.getTime() - date1.getTime();
                    let diffDays = Math.ceil(difference / (1000 * 3600 * 24));
                    console.log(difference, "this is the diff")
                    if (diffDays >= 60) {
                        const access_codes = await this.fbinboxservice.getAccessCodes(fb_code, state, res);
                        const long_lived_token = await this.fbinboxservice.getLongLivedAccessCodes(access_codes.access_token);
                        console.log("long_lived_tokendiffDays=====", long_lived_token);
                        const fb_user_obj = await this.fbinboxservice.getFbUserObj(long_lived_token.access_token);
                        console.log("fb_user_obj==diffDays===", fb_user_obj);
                        getCofigs['fb_user_id'] = fb_user_obj.id;
                        getCofigs['access_token'] = long_lived_token.access_token;
                        getCofigs['token_type'] = long_lived_token.token_type;

                    }

                } else {
                    const access_codes = await this.fbinboxservice.getAccessCodes(fb_code, state, res);
                    const long_lived_token = await this.fbinboxservice.getLongLivedAccessCodes(access_codes.access_token);
                    console.log("long_lived_token===else==", long_lived_token);
                    const fb_user_obj = await this.fbinboxservice.getFbUserObj(long_lived_token.access_token);
                    console.log("fb_user_obj==else===", fb_user_obj);
                    getCofigs['fb_user_id'] = fb_user_obj.id;
                    getCofigs['access_token'] = long_lived_token.access_token;
                    getCofigs['token_type'] = long_lived_token.token_type;
                    getCofigs['user_access_token_expire'] = new Date();
                }
                console.log("State id from Mongodb", getCofigs);
                console.log(getCofigs, "Configsssss aafter adding two more keys");
                let updateDb = await this.config.update({ sub_id: state }, getCofigs);
                console.log("Update Db object", updateDb);
                //checking RD version for redirection
                let rdVersion = await this.fbinboxservice.getonlyversion(updateDb);
                if (rdVersion) {
                    const versionUrl = rdVersion.application_type == '1.0' ? 'config/SquareNew' : 'nux/integration/index#/connect';
                    console.log("server_url---before added-----", versionUrl);
                    let server_url = `https://${getCofigs.server}/index.php?r=${versionUrl}?redirect=true`;
                    console.log("server_url---http added-----", server_url);
                    res.redirect(server_url);
                    return;
                }
                // let server_url = "https://" + getCofigs.server + '/index.php?r=nux/integration/index#/connect?redirect=true';
                // console.log("server_url---http added-----", server_url);
                // res.redirect(server_url);
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                    "error": true,
                    "message": "User Not Found"
                })
            }

            // console.log(updateDb, "Retrived Document for this state")
            // res.send(updateDb);
        } else {
            res.send("State is not defined")
        }
    }

    @Post('get-all-fbpages')
    async getAllPages(@Body() cookie: Cookie, @Res() res: any) {
        try {
            let cookee = cookie.cookie_;
            let dycrpted = this.commonService.decrypt(cookee);
            console.log("dycrypted======", dycrpted);
            if (dycrpted) {
                let user_info = await this.config.readByUserID({ user_id: dycrpted.uid });
                console.log("User_info========", user_info);
                if (user_info) {
                    //Get Access Tokens of Pages You Manage
                    const all_page_access_token = await this.fbinboxservice.getAllPageAccessToken(user_info.access_token, user_info.fb_user_id);
                    if (all_page_access_token) {
                        return res.status(HttpStatus.OK).json({
                            // "error": false,
                            success: "Fetched Pages list Successfully",
                            data: all_page_access_token,
                        })
                    } else {
                        return res.status(HttpStatus.BAD_REQUEST).json({
                            "error": true,
                            success: "Fetched Pages list is Empty",
                            data: all_page_access_token,
                        })
                    }

                }
                else {
                    res.status(HttpStatus.BAD_REQUEST).json({
                        "error": true,
                        "message": "User Not Found"
                    })

                }
            } else {

                res.status(HttpStatus.BAD_REQUEST).json({
                    "error": true,
                    "message": "Cookie is not valid."
                })


            }

        } catch (error) {
            throw new HttpException(error, 400);
        }


    }

    @Post('save-fbpage-info')
    async savePageInfo(@Body() savefbpageinfo: SaveFBPageInfo, @Res() res: any) {
        try {
            let cookie = savefbpageinfo.cookie_;
            let dycrpted = this.commonService.decrypt(cookie);
            if (dycrpted) {
                console.log("dycrypted======", dycrpted);
                let UserObj = await this.config.findOne({ user_id: dycrpted.uid });
                console.log(UserObj, "UserOBJ=====");
                if (UserObj) {
                    UserObj['fb_page_id'] = savefbpageinfo.fb_page_id;
                    UserObj['fb_page_name'] = savefbpageinfo.fb_page_name;
                    UserObj['page_access_token'] = savefbpageinfo.access_token;
                    UserObj['facebook_enabled'] = true;
                    let updateFbPageInfo = await this.config.updateFbPageInfo({ user_id: dycrpted.uid }, UserObj)
                    console.log("updateFbPageInfo====", updateFbPageInfo);
                    return res.status(HttpStatus.OK).json({
                        success: "Updated User Information Successfully"
                    })
                } else {
                    res.status(HttpStatus.BAD_REQUEST).json({
                        "error": true,
                        "message": "User Not Found"
                    })
                }
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                    "error": true,
                    "message": "cookie is not valid."
                })
            }

        } catch (error) {
            throw new HttpException(error, 400);

        }


    }

    @Get("successfully-authenticated")
    successAuth(): string {
        return "successfully authenticated Page is Working";
    }

    @Get()
    getHello(): string {
        return "Page is Working";
    }

    @Post('enable-rdInbox')
    async enableDisableRdInbox(@Req() req: Request, @Body() enableRdInbox: EnableRdInbox, @Res() res: any) {
        try {
            console.log("path => ", req.url);
            let cookee = enableRdInbox.cookie_;
            let enablevalue = enableRdInbox.enableBit;
            let dycrpted = this.commonService.decrypt(cookee);
            if (dycrpted) {
                let findUser = await this.config.findOne({ sub_id: dycrpted.sub_id });
                if (findUser) {
                    //save App configuration Entry in Database
                    if (enablevalue) {
                        let saveAppConfigs = await this.fbinboxservice.setSaveAppConfig(findUser, true);
                    } else {
                        let saveAppConfigs = await this.fbinboxservice.setSaveAppConfig(findUser, false);
                    }
                    let updateEnabledValue = await this.config.updateRdEnabled({ sub_id: dycrpted.sub_id }, enablevalue)
                    return res.status(HttpStatus.OK).json({
                        success: "User Updated Successfully",
                        data: updateEnabledValue.rd_enabled,
                    })
                } else {
                    dycrpted['rd_enabled'] = enablevalue;
                    dycrpted['user_id'] = dycrpted.uid;
                    console.log(dycrpted, "==DDDDDD");
                    let createUser = await this.config.create(dycrpted);
                    //save App configuration Entry in Database
                    let saveAppConfigs = await this.fbinboxservice.setSaveAppConfig(dycrpted, true);
                    return res.status(HttpStatus.CREATED).json({
                        success: "User Created Successfully",
                        data: createUser.rd_enabled,
                    })
                }
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                    "error": true,
                    "message": "cookie is not valid."
                });
            }

        } catch (error) {
            console.log(error)
            throw new HttpException(error, 400);

        }
    }

    @Post('is-enabled-rdInbox')
    async isEnabledRdinbox(@Req() req: Request, @Body() cookieParam: Cookie, @Res() res: any) {
        try {
            let cookee = cookieParam.cookie_;
            let dycrpted = this.commonService.decrypt(cookee);
            console.log(dycrpted, "dysctrypted Object");
            const user_id = dycrpted.uid;
            dycrpted.user_id = user_id;
            if (dycrpted) {

                // let findRdEnabled = await this.config.findOne({ user_id: dycrpted.uid });
                if (dycrpted) {
                    let rdVersion = await this.fbinboxservice.getonlyversion(dycrpted);
                    console.log("=======rdVersion=findRdEnabled========", rdVersion);
                    if (rdVersion) {
                        
                        const versionUrl = rdVersion.application_type == '1.0' ? 'config/integration' : 'nux/integration/index#/';
                        const backURL = `https://${dycrpted.server}/index.php?r=${versionUrl}`;
                        
                        res.status(HttpStatus.OK).json({
                            "status": true,
                            "back_url": backURL,
                            "message": "User Found"
                        })
                    }
                } else {
                    res.status(HttpStatus.BAD_REQUEST).json({
                        "error": true,
                        "message": "User Not Found"
                    })
                }

            } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                    "error": true,
                    "message": "cookie is not valid."
                })

            }

        } catch (error) {
            console.log(error, "------------------");
            throw new HttpException(error, 400);

        }




    }

    @Post('is-enabled-rdInbox-original')
    async isEnabledRdinboxOriginal(@Req() req: Request, @Body() cookieParam: Cookie, @Res() res: any) {
        try {
            let cookee = cookieParam.cookie_;
            let dycrpted = this.commonService.decrypt(cookee);
            console.log(dycrpted, "dysctrypted Object");
            if (dycrpted) {
                res.status(HttpStatus.OK).json({
                    "status": true,
                    "back_url": dycrpted.server,
                    "message": "User Found"
                })
                let findRdEnabled = await this.config.findOne({ user_id: dycrpted.uid });
                if (findRdEnabled) {
                    let rdVersion = await this.fbinboxservice.getonlyversion(findRdEnabled);
                    console.log("=======rdVersion=findRdEnabled========", rdVersion);
                    if (rdVersion) {
                        
                        const versionUrl = rdVersion.application_type == '1.0' ? 'config/integration' : 'nux/integration/index#/';
                        const backURL = `https://${findRdEnabled.server}/index.php?r=${versionUrl}`;
                        
                        res.status(HttpStatus.OK).json({
                            "status": findRdEnabled.rd_enabled,
                            "back_url": backURL,
                            "message": "User Found"
                        })
                    }
                } else {
                    res.status(HttpStatus.BAD_REQUEST).json({
                        "error": true,
                        "message": "User Not Found"
                    })
                }

            } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                    "error": true,
                    "message": "cookie is not valid."
                })

            }

        } catch (error) {
            console.log(error, "------------------");
            throw new HttpException(error, 400);

        }




    }

    @Post('disable-facebook-rdInbox')
    async disableFacebookRdInbox(@Req() req: Request, @Body() enableRdInbox: Cookie, @Res() res: any) {
        try {
            let cookee = enableRdInbox.cookie_;
            let enablevalue = false;
            let dycrpted = this.commonService.decrypt(cookee);
            if (dycrpted) {
                let findUser = await this.config.findOne({ sub_id: dycrpted.sub_id });
                if (findUser) {
                    let updateEnabledValue = await this.config.updateFacebookEnable({ sub_id: dycrpted.sub_id }, enablevalue)
                    return res.status(HttpStatus.OK).json({
                        success: true,
                        message: "User Facebook has been disabled Successfully"
                    })
                } else {
                    return res.status(HttpStatus.BAD_REQUEST).json({
                        "error": true,
                        "message": "User not Found."
                    });
                }
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                    "error": true,
                    "message": "cookie is not valid."
                });
            }

        } catch (error) {

            throw new HttpException(error, 400);

        }



    }

    @Post('get-backnhelp-url')
    async getBacknHelpUrl(@Req() req: Request, @Body() enableRdInbox: Cookie, @Res() res: any) {
        try {
            let cookee = enableRdInbox.cookie_;
            let dycrpted = this.commonService.decrypt(cookee);
            if (dycrpted) {
                let findUser = await this.config.findOne({ sub_id: dycrpted.sub_id });
                if (findUser) {
                    const onlyVersion = await this.fbinboxservice.getonlyversion(findUser);
                    const versionUrl = onlyVersion.application_type == '1.0' ? 'config/integration' : 'nux/integration/index#/';
                    const backURL = `https://${findUser.server}/index.php?r=${versionUrl}`;
                    const helpURL = onlyVersion.application_type == '1.0' ? 'https://help.repairdesk.co/knowledgebase/articles/1992403-square' : 'https://docs.repairdesk.co/square';
                    return res.status(HttpStatus.OK).json({
                        success: true,
                        backURL: backURL,
                        helpURL: helpURL
                    })
                } else {
                    return res.status(HttpStatus.BAD_REQUEST).json({
                        "error": true,
                        "message": "User not Found."
                    });
                }
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                    "error": true,
                    "message": "cookie is not valid."
                });
            }

        } catch (error) {

            throw new HttpException(error, 400);

        }



    }

}
