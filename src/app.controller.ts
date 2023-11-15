import { Controller, Get } from '@nestjs/common';
import { exit } from 'process';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('abc')
  getHello(): string {
    console.log("wwwwwww");
    return this.appService.getServerlessApp();
  }
}
