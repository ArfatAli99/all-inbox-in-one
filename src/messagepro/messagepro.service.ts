import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class MessageproService {
    constructor(
        private readonly httpService: HttpService,
    ) { }

    async getallLogs(userInfo, logsphone) {
        const headers_param = {
            'Accept': 'application/json',
            'Cookie': `ucf_y5ee30efecf176f14ce8d28012c216dcc=${logsphone.cookie_}`,
            'Origin': `https://${userInfo.server}`
        }
        const body_params = { pagesize: logsphone.pagesize, page: logsphone.page }
        try {
            return await lastValueFrom(
                this.httpService.post("https://api.repaircrm.co/api/web/v2/messagepro/calllogs", body_params, {headers: headers_param}).pipe(
                    map(resp => resp.data)
                )
            );

        } catch (error) {
            // console.log("phone pro error start",error.message,"phone pro error");
            return error;
        }

    }

    async getPhoneProConversations(userInfo, request) {

        try {
            const headersRequest = {
                'Accept': 'application/json',
                'Cookie': `ucf_y5ee30efecf176f14ce8d28012c216dcc=${request.cookie_}`,
                'Origin': `https://${userInfo.server}`
            }
            let threads = await lastValueFrom(
                this.httpService.post(`https://api.repaircrm.co/api/web/v2/messagepro/loadrooms`, { page: request.page - 1 }, { headers: headersRequest }).pipe(
                    map(resp => resp.data)
                )
            );

            threads = Promise.all(threads.data.map(async (thread) => ({
                id: thread.to, unread_count: thread.unreadCount, snippet: thread.lastMessage.content, sorting_time: Date.parse(thread.lastMessage.fulltimestamp), updated_time: thread.lastMessage.fulltimestamp, appType: 'PhonePro',
                participants: {
                    data: [
                        {
                            id: thread.users[0]._id == 1 ? thread.users[1]._id : thread.users[0]._id,
                            name: thread.users[0]._id == 1 ? thread.roomName : thread.users[0].username
                        },
                        {
                            id: thread.users[1]._id == 1 ? thread.users[1]._id : thread.users[1]._id,
                            name: thread.users[1]._id == 1 ? thread.roomName : thread.users[1].username
                        }
                    ]
                },
                messages: {
                    data:
                        (await lastValueFrom(
                            this.httpService.post(`https://api.repaircrm.co/api/web/v2/messagepro/loadmsg`, { id: thread.to }, { headers: headersRequest }).pipe(
                                map(resp => resp.data.msg.map(msg => ({
                                    message: msg.content,
                                    id: msg._id,
                                    thread_id: thread.to,
                                    from: {
                                        name: (thread.users[0]._id == msg.senderId && msg.senderId == 1 ? thread.users[1].username : thread.roomName),
                                        email: '',
                                        id: (msg.senderId == 1 ? 1 : 0)
                                    },
                                    to: {
                                        data: [
                                            {
                                                name: (thread.users[0]._id == msg.senderId && msg.senderId == 1 ? thread.roomName : thread.users[1].username),
                                                email: '',
                                                id: (msg.senderId == 1 ? 0 : 1)
                                            }
                                        ]
                                    },
                                    created_time: msg.fulltimestamp,
                                    sorting_time: Date.parse(msg.fulltimestamp)
                                })))
                            )
                        )).sort((a, b) => a.sorting_time - b.sorting_time).reverse()
                }
            })));
            return await threads;

        } catch (error) {
            console.log("messagepro error => ", error);
            // return {"data": [], "page": {}};

            return [];
            // throw new HttpException(error, 400);

        }
    }

    async addNote(userInfo, cookie) {
        // const url = `https://${userInfo.server}`;
        const url = `https://rd2021824.repaircrm.co/index.php?r=sms/addnote`;

        const headers_param = {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': 'ucfy=o5p3m1nvl0jp2komjlgbudma58; _lang=en'
        }
        
        const data_txt = "txt=doing_some_testdsadasaads&id=93888&cid=5731359"
        try {
            return await lastValueFrom(
                this.httpService.post(url, {data_txt},{ headers: headers_param }).pipe(
                    map(resp => resp.data)
                )
            );

        } catch (error) {
            // console.log("phone pro error start",error.message,"phone pro error");
            return error;
        }

    }

}
