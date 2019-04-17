import {Service} from 'typedi';
import {ICloudflareConfig, IConfig, IFileNameConfig, IGoogleCloudConfig, TFileName} from '../types/interfaces';

@Service()
export class ConfigService implements IConfig {
  public acmeServer: 'prod' | 'staging';
  public domain: string;
  public email: string;
  public cloudflare: ICloudflareConfig;
  public googleCloud: IGoogleCloudConfig;
  public fileNames: IFileNameConfig;
  public agreeTerms: boolean;
  
  constructor(config: IConfig) {
    Object.keys(config).forEach((key) => {
      this[key] = config[key];
    });
  }
  
  getFileName(file: TFileName) {
    return this.fileNames[file];
  }
  
  getParentDomain() {
    const parentDomain = this.domain.split('.');
    return `${parentDomain[parentDomain.length - 2]}.${parentDomain[parentDomain.length - 1]}`;
  }
}
