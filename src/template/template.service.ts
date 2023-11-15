import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Template, TemplateDocument } from "src/database/schemas/template.schema";
import { CreateTemplateDTO, TemplateDTO } from 'src/dto/template.dto';

@Injectable()
export class TemplateService {
    constructor(
        @InjectModel(Template.name) private readonly configModel: Model<TemplateDocument>
    ) { }
    async create(template: CreateTemplateDTO): Promise<Template> {
        const newTemplate = new this.configModel(template);
        return newTemplate.save();
    }

    async update(params, Template): Promise<Template> {
        return await this.configModel.findOneAndUpdate(params, {
            $set: {
                sub_id: Template.sub_id,
                store_id: Template.store_id,
                coversation_id: Template.coversation_id,
                conversation_type: Template.conversation_type
            }
        }, { new: true }).exec()
    }

    async delete(template): Promise<any> {
        return await this.configModel.findOneAndDelete({ user_id: template.user_id }).exec();
    }

    async readByUserID(template): Promise<Template> {
        return await this.configModel.findOne({ user_id: template.user_id }).exec();
    }

    async readBySubID(template): Promise<Template> {
        return await this.configModel.findOne({ sub_id: template.sub_id }).exec();
    }

}
