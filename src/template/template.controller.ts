import { Body, Controller, HttpException, HttpStatus, Post, Res } from '@nestjs/common';
import { CreateTemplateDTO, TemplateDTO } from 'src/dto/template.dto';
import { TemplateService } from './template.service';

@Controller('template')
export class TemplateController {
    constructor
        (
            private readonly template: TemplateService,

    ) { }

    @Post('create')
    async createTemplate(@Res() res: any, @Body() template: CreateTemplateDTO) {
        console.log("===template", template);
        try {
            const created = await this.template.create(template);
            if (created) {
                res.status(HttpStatus.CREATED).json({
                    "message": "Template Created successfully"
                })

            } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                    "error": true,
                    "message": "Template not created"
                })
            }
            console.log("===created", created);
            return created;

        } catch (error) {

            throw new HttpException(error, 400);

        }

    }
    @Post('read')
    async readTemplate(@Res() res: any, @Body() template: TemplateDTO) {
        try {
            const template_data = await this.template.readByUserID(template);
            if (template_data) {
                return res.status(HttpStatus.OK).json({
                    template_data
                })
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                    "error": true,
                    "message": "No record against this ID."
                })
            }

        } catch (error) {
            throw new HttpException(error, 400);

        }

    }
    @Post('update')
    async updateTemplate(@Res() res: any, @Body() template: CreateTemplateDTO) {
        try {
            let updateDb = await this.template.update({ user_id: template.user_id }, template);

            return res.status(HttpStatus.OK).json({
                success: "User Template Updated Successfully",
                data: updateDb,
            })
        } catch (error) {
            throw new HttpException(error, 400);

        }

    }
    @Post('delete')
    async deleteTemplate(@Res() res: any, @Body() template: TemplateDTO) {
        console.log("===deleted", template);

        try {
            const deleted = await this.template.delete(template);
            console.log("===deleted", deleted);

            if (deleted) {
                return res.status(HttpStatus.OK).json({
                    "message": "Successfully deleted the template against this User."
                })
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({
                    "error": true,
                    "message": "No record against this ID."
                })
            }
        } catch (error) {
            throw new HttpException(error, 400);

        }

    }

}



