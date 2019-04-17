import {Container, Service} from 'typedi';
import {Storage} from '@google-cloud/storage';
import * as fs from "fs";
import {ConfigService} from './configService';
import {TFileName} from '../types/interfaces';

@Service()
export class GCloudStorageService {
  private config: ConfigService;
  private storage: Storage;
  
  constructor() {
    this.config = Container.get(ConfigService);
    this.storage = new Storage({
      projectId: this.config.googleCloud.projectId,
      credentials: {
        client_email: this.config.googleCloud.credentials.email,
        private_key: this.config.googleCloud.credentials.privateKey
      }
    });
  }
  
  read(file: TFileName): Promise<string | undefined> {
    return new Promise(async (resolve) => {
      const fileName = this.config.getFileName(file);
      let buffer = '';
      const exists = (await this.storage.bucket(this.config.googleCloud.bucketName).file(fileName).exists())[0];
      if (exists) {
        this.storage.bucket(this.config.googleCloud.bucketName).file(fileName).createReadStream()
          .on('data', d => buffer += d)
          .on('end', () => resolve((buffer === 'undefined') ? undefined : buffer));
      } else {
        resolve(undefined);
      }
    })
  }
  
  async write(file: TFileName, fileContent: string): Promise<string> {
    const fileName = this.config.getFileName(file);
    fs.writeFileSync(fileName, fileContent, {encoding: 'utf-8'});
    await this.storage.bucket(this.config.googleCloud.bucketName).upload(fileName);
    fs.unlinkSync(fileName);
    return fileContent;
  }
}
