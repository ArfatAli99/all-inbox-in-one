import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req, Request, Res } from '@nestjs/common';
import { LogsPhonePro } from 'src/dto/messagepro.dto';
import { Cookie } from 'src/dto/rd-common.auth';
import { MessageproService } from './messagepro.service';
import { CommonServices } from 'src/services/common.services';
import { RdConfigService } from 'src/services/rd_config/rd_config.service';
import { SocketTrackService } from 'src/services/socket_track_wh.service';
// import { Cookie } from 'cookiejar';


@Controller('messagepro')
export class MessageproController {
    constructor(
        private readonly messageproservice: MessageproService,
        private readonly commonService: CommonServices,
        private readonly config: RdConfigService,
        private readonly socketTrackWH: SocketTrackService
    ) { }
    // get messagepro logs
    @Post('get-messagepro-logs')
    async getPhoneProLogs(@Req() req: Request, @Body() logsphone: LogsPhonePro, @Res() res: any) {
        try {
            console.log("logsphone", logsphone.cookie_)
            let dycrpted = this.commonService.decrypt(logsphone.cookie_);
            if (dycrpted) {
                /* let user_info = await this.config.readByUserID({ user_id: dycrpted.uid });
                
                if (user_info) { */
                    console.log("i am in the user_info");

                    const logs_data = await this.messageproservice.getallLogs(dycrpted, logsphone);
                    if ((logs_data.hasOwnProperty('status')) && logs_data.status == 200) {
                        res.status(HttpStatus.OK).json({
                            logs_data
                        });
                    } else {
                        // console.log("Error Data Start=============>", logs_data, logs_data.response.data.status , "END");
                        const error = logs_data.response.data;
                        res.status(401).json({
                            error
                        });

                    }
                    

                /* } else {
                    res.status(HttpStatus.BAD_REQUEST).json({
                        "error": true,
                        "message": "User Not Found."
                    })

                } */
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
    // get messagepro logs
    @Post('webhook-received-msg')
    async whReceivedMsg(@Body() rawbody: any, @Res() res: any) {
        try {
            console.log("wh/webhook-received-msg request body =>", rawbody)

            if (!rawbody.sub_id) {
                return res.status(422).json({message: "sub_id required"})
        
            } else if (!rawbody.store_id) {
                return res.status(422).json({message: "store_id required"})
        
            } else if (!rawbody.sender_id) {
                return res.status(422).json({message: "sender_id required"})
        
            } else if (!rawbody.room_id) {
                return res.status(422).json({message: "room_id required"})
        
            } else if (!rawbody.room_name) {
                return res.status(422).json({message: "room_name required"})
        
            }/*  else if (!rawbody.msg_id) {
                return res.status(422).json({message: "msg_id required"})
        
            } */ else if (!rawbody.timestamp) {
                return res.status(422).json({message: "timestamp required"})
        
            } else if (!rawbody.message) {
                return res.status(422).json({message: "message required"})
            }

            /* const user_info = await this.config.findOne({sub_id: rawbody.sub_id, store_id: rawbody.store_id });
            console.log("user_info =>", user_info)
            if (user_info) { */
            const socketConnections = await this.socketTrackWH.readAll({sub_id: rawbody.sub_id, store_id: rawbody.store_id });
            console.log("socketConnections =>", socketConnections)
            if (socketConnections.length > 0) {
                
                const saveLogs = await this.commonService.sendAxioPostReq(`https://ufi0ra8rn6.execute-api.us-east-1.amazonaws.com/dev/notifications/save-notification`, {
                    "store_id": rawbody.sub_id,
                    "title": "PhonePro Message",
                    "description": rawbody.message,
                    "status": "unread",
                    "app": "messagepro"
                });

                console.log("=======saveLogs=======", saveLogs);

                const msgData = {
                    sender: { id: rawbody.sender_id },
                    recipient: { id: 0 },
                    timestamp: rawbody.timestamp,
                    threadName: rawbody.room_name,
                    appType: 'PhonePro',
                    message: {
                        mid: rawbody.msg_id,
                        text: rawbody.message
                    }
                }
                rawbody.room_name = ['', " ", null, undefined, 'undefined'].includes(rawbody.room_name) ? rawbody.sender_id : rawbody.room_name;
                const thread = {
                    id: rawbody.sender_id,
                    unread_count: 1,
                    snippet: rawbody.message,
                    updated_time: rawbody.fulltimestamp,
                    appType: 'PhonePro',
                    participants: {
                        data: [
                            {
                                id: 0,
                                name: ''
                            },
                            {
                                id: 1,
                                name: rawbody.room_name
                            }
                        ]
                    },
                    messages: {
                        data: 
                            // (
                                rawbody.messages.map(msg => ({
                                    message: msg.content,
                                    id: msg._id,
                                    thread_id: rawbody.sender_id,
                                    from: {
                                        name: (msg.senderId == 1 ? rawbody.room_name: ''),
                                        email: '',
                                        id: (msg.senderId == 1 ? rawbody.sender_id: 0)
                                    },
                                    to: {
                                        data: [
                                            {
                                                name: (msg.senderId == 1 ? '': rawbody.room_name),
                                                email: '',
                                                id: (msg.senderId == 1 ? 0: rawbody.sender_id)
                                            }
                                        ]
                                    },
                                    created_time: msg.fulltimestamp,
                                    sorting_time: Date.parse(msg.fulltimestamp)
                                }))
                            // ).sort((a, b) => a.sorting_time - b.sorting_time).reverse()
                    }
                };
                thread.messages.data.push({
                    message: rawbody.message,
                    id: 123,
                    thread_id: rawbody.sender_id,
                    from: {
                        name: rawbody.room_name,
                        email: '',
                        id: rawbody.sender_id
                    },
                    to: {
                        data: [
                            {
                                name: '',
                                email: '',
                                id: 0
                            }
                        ]
                    },
                    created_time: rawbody.fulltimestamp,
                    sorting_time: Date.parse(rawbody.fulltimestamp)
                })
                thread.messages.data.sort((a, b) => a.sorting_time - b.sorting_time).reverse()
                console.log('thread => ',thread.messages.data)
                
                    
                for (const connection of socketConnections) {

                    await this.commonService.sendMessageToWebhook(connection.connectionId, thread);
                }
                

            }

            return res.status(200).json({
                status: 1
            });
        } catch (err) {
            console.log("catch error on send msg to socket phonepor =>", err)
        }
    }

    @Post('add-note')
        async addNote(@Req() req: Request, @Body() cookie: Cookie, @Res() res: any) {
            try {
                console.log("logsphone", cookie.cookie_)
                let dycrpted = this.commonService.decrypt(cookie.cookie_);
                if (dycrpted) {
                    let user_info = await this.config.readByUserID({ user_id: dycrpted.uid });
                    
                    if (user_info) {
                        console.log("i am in the user_info");
    
                        const notes_data = await this.messageproservice.addNote(user_info, cookie);
                        if ((notes_data.hasOwnProperty('status')) && notes_data.status == 1) {
                            res.status(HttpStatus.OK).json({
                                notes_data
                            });
                        } else {
                            // console.log("Error Data Start=============>", logs_data, logs_data.response.data.status , "END");
                            const error = notes_data.response.data;
                            res.status(401).json({
                                error
                            });
    
                        }
                        
    
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
    @Get()
    getHello(): string {
        console.log("i m in get request");
        return "phone PRO is Working==============";
    }





}
