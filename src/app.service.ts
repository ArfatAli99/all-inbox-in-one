import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getServerlessApp(): string {
    return 'Hello ServerlessApp!';
  }
}
