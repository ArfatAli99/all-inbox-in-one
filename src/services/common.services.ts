import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import { Injectable} from "@nestjs/common";
// const oauth1a = require("oauth-1.0a");
const crypto = require("crypto");0

// import { AWS } from 'aws-sdk';
const AWS = require('aws-sdk')
// AWS.config.update({region:'us-east-1'});

const hash = (string) => {
  return crypto.createHash('sha256').update(string).digest('hex');
};

const encryptionMethod = 'AES-256-CBC';
const secret = hash('mtsstring123@').substring(0, 32);
const iv = hash('mtsstring123@').substring(0, 16);

@Injectable()
export class CommonServices {

  constructor(
    private readonly httpService: HttpService
  ) { }

  // encrypt(text) {
  //   var cipher = crypto.createCipher(algorithm, password);
  //   var crypted = cipher.update(text, "utf8", "hex");
  //   crypted += cipher.final("hex");
  //   return crypted;
  // }

  // decrypt(text) {
  //   var decipher = crypto.createDecipher(algorithm, password);
  //   var dec = decipher.update(text, "hex", "utf8");
  //   dec += decipher.final("utf8");
  //   return dec;
  // }
  encrypt(plain_text) {
    try {
      const encryptor = crypto.createCipheriv(encryptionMethod, secret, iv);
      const singleEncryptedMessage =
        encryptor.update(plain_text, 'utf8', 'base64') +
        encryptor.final('base64');
      return Buffer.from(singleEncryptedMessage).toString('base64');
    } catch (e) {
      return null;
    }
  }

  decrypt(encryptedMessage) {
    try {
      const singleDecryptedMessage = Buffer.from(
        encryptedMessage,
        'base64',
      ).toString('ascii');
      const decryptor = crypto.createDecipheriv(encryptionMethod, secret, iv);
      return (
        JSON.parse(decryptor.update(singleDecryptedMessage, 'base64', 'utf8') +
          decryptor.final('utf8'))
      );
    } catch (e) {
      return null;
    }
  }

  async sendMessageToWebhook(conn_id, message) {
    console.log("Im in the  sendMessageToWebhook function", conn_id, message);
    try {
        const ENDPOINT = '5l20iwctp0.execute-api.us-east-1.amazonaws.com/production/';
        const client = new AWS.ApiGatewayManagementApi({ endpoint: ENDPOINT });
        await client.postToConnection({
            'ConnectionId': conn_id,
            'Data': Buffer.from(JSON.stringify(message)),
        }/* , (err, data) => {
            if (err) console.log("socket error =>", err, err.stack); // an error occurred
            else     console.log("socket msg =>", data);           // successful response
          } */).promise().catch(err => console.log(err));

        // return test;
    } catch (error) {
        console.log("error=sendMessageToWebhook========", error);
    }
  }

  sendAxioPostReq(url, data) {
    return lastValueFrom(
      this.httpService.post(url, data).pipe(
          map(resp => resp.data)
      )
    );
  }

  sendAxioGetReq(url, data) {
    return lastValueFrom(
      this.httpService.get(url, data).pipe(
          map(resp => resp.data)
      )
    );
  }

}

