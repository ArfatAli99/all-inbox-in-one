import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Config, ConfigDocument } from "src/database/schemas/rd_config.schema";

@Injectable()
export class RdConfigService {
    constructor(
        @InjectModel(Config.name) private readonly configModel: Model<ConfigDocument>
    ) { }
    async create(config: Config): Promise<Config> {
        console.log(config,"this is from the service")
        const newConfig = new this.configModel(config);
        return newConfig.save();
    }

    async readAll(): Promise<Config[]> {
        return await this.configModel.find().exec();
    }

    async readById(id): Promise<Config> {
        return await this.configModel.findById(id).exec();
    }

    async findOne(param): Promise<Config> {
        return this.configModel.findOne(param).exec();
    }

    async update(params, Config): Promise<Config> {
        console.log(params, Config,"Coming from the parent function")
        return await this.configModel.findOneAndUpdate(params, {$set: {
            "access_token": Config.access_token, 
            token_type: Config.token_type, 
            fb_user_id:Config.fb_user_id,
            user_access_token_expire:Config.user_access_token_expire
            // page_access_token:Config.page_access_token,
            // fb_page_id:Config.fb_page_id
        }},{ new: true }).exec()
    }

    async updateFbPageInfo(params, Config): Promise<Config> {
        console.log(params, Config,"Coming from the parent updateFbPageInfo");
        return await this.configModel.findOneAndUpdate(params, {$set: {
            page_access_token:Config.page_access_token,
            fb_page_id:Config.fb_page_id,
            fb_page_name:Config.fb_page_name,
        }},{ new: true }).exec()
    }

    async updateRdEnabled(params, enableBit): Promise<Config> {
        console.log(params, enableBit, "Coming from the parent function")
        // return await this.configModel.findOneAndUpdate(params, {$set: {"rd_enabled": Config.enableBit}}, { new: true }).exec()
        return await this.configModel.findOneAndUpdate(params, {$set: {"rd_enabled": enableBit}}, { new: true }).exec()
    }
    async updateFacebookEnable(params, enableBit): Promise<Config> {
        console.log(params, enableBit, "Coming from the parent function to updateFacebookEnable")
        return await this.configModel.findOneAndUpdate(params, {$set: {"facebook_enabled": enableBit,"page_access_token":"","fb_page_id":"","fb_user_id":"","access_token":"","user_access_token_expire":""}}, { new: true }).exec()
    }

    async delete(id): Promise<any> {
        return await this.configModel.findByIdAndRemove(id).exec();
    }

    async readByUserID(user): Promise<Config> {
        return await this.configModel.findOne({ user_id: user.user_id }).exec();
    }

    async getUserInfoByPageID(recipient_Id): Promise<Config> {
        console.log('here in pageID', recipient_Id)
        return this.configModel.findOne({ fb_page_id: recipient_Id });
    }


}
