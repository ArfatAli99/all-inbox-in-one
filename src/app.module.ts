import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FbinboxModule } from './fbinbox/fbinbox.module';
import { GoogleBusinessModule } from './googlebusiness/googlebuisness.module';
import { ConfigModule } from '@nestjs/config';
import { MessageproModule } from './messagepro/messagepro.module';
import { TemplateModule } from './template/template.module';

@Module({
  imports: [ConfigModule.forRoot(), MongooseModule.forRoot(process.env.MONGO_DB_CONNECTION), FbinboxModule,GoogleBusinessModule,MessageproModule, TemplateModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
