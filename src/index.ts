import "reflect-metadata";
import * as letiny from 'letiny';
import {IConfig} from './types/interfaces';
import {Container} from "typedi";
import {GCloudStorageService} from './services/gCloudStorageService';
import {ConfigService} from './services/configService';
import {CloudflareService} from './services/cloudflareService';

export class AcmeClient {
  config: ConfigService;
  gCloudStorage: GCloudStorageService;
  cloudflareService: CloudflareService;
  
  constructor(config: IConfig) {
    Container.set(ConfigService, new ConfigService(config));
    Container.set(GCloudStorageService, new GCloudStorageService());
    Container.set(CloudflareService, new CloudflareService());
    this.config = Container.get(ConfigService);
    this.gCloudStorage = Container.get(GCloudStorageService);
    this.cloudflareService = Container.get(CloudflareService);
  }
  
  getCert(): Promise<{ key: string, cert: string }> {
    return new Promise(async (resolve1) => {
      const currentCert = await this.gCloudStorage.read('cert');
      if (!currentCert || !(currentCert && (new Date().getTime() - (letiny.getExpirationDate(currentCert) as Date).getTime()) / (1000 * 60 * 60 * 24.0))) {
        letiny.getCert({
          method: 'dns-01',
          email: this.config.email,
          domains: this.config.domain,
          url: (this.config.acmeServer === 'staging') ? 'https://acme-staging.api.letsencrypt.org' : undefined,
          challenge: async (domain, _, data, done) => {
            await this.cloudflareService.removeChallengeRecord();
            this.cloudflareService.addChallengeRecord(data).then(async () => {
              done();
            });
          },
          agreeTerms: this.config.agreeTerms
        }, async (err, cert, key, caCert, accountKey) => {
          await this.gCloudStorage.write('cert', cert);
          await this.gCloudStorage.write('caCert', caCert);
          await this.gCloudStorage.write('privateKey', key);
          await this.gCloudStorage.write('accountKey', accountKey);
          await this.cloudflareService.removeChallengeRecord();
          resolve1({
            key: key,
            cert: cert + `
            ` + caCert
          })
        });
      } else {
        resolve1({
          key: await this.gCloudStorage.read('privateKey'),
          cert: `${currentCert}
        ${(await this.gCloudStorage.read('caCert'))}`
        })
      }
    })
  }
  
}
