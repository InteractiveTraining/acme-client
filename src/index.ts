import "reflect-metadata";
import {IConfig} from './types/interfaces';
import {Container} from "typedi";
import {GCloudStorageService} from './services/gCloudStorageService';
import {ConfigService} from './services/configService';
import {CloudflareService} from './services/cloudflareService';
import * as acme from 'acme-client';
import {Authorization, Challenge, ChallengeKey} from 'acme-client';
import * as forge from 'node-forge';

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
  
  async getCert(): Promise<{ key: string, cert: string }> {
    const currentCert = await this.gCloudStorage.read('cert');
    let accountKey: string | Buffer = await this.gCloudStorage.read('accountKey');
    
    if (!accountKey) {
      accountKey = await acme.forge.createPrivateKey();
      await this.gCloudStorage.write('accountKey', accountKey.toString());
    }
    
    if (!(!currentCert || (currentCert && (new Date().getTime() + (60 * 60 * 24 * 28 * 1000)) >= forge.pki.certificateFromPem(currentCert).validity.notAfter.getTime()))) {
      return {
        key: await this.gCloudStorage.read('privateKey'),
        cert: await this.gCloudStorage.read('cert')
      };
    }
    
    const client = new acme.Client({
      directoryUrl: (this.config.acmeServer === 'staging') ? acme.directory.letsencrypt.staging : acme.directory.letsencrypt.production,
      accountKey: (typeof accountKey === 'string') ? Buffer.from(accountKey, 'utf8') : accountKey
    });
    
    const [key, csr] = await acme.forge.createCsr({
      commonName: this.config.domain
    });
    
    const cert = await client.auto({
      csr,
      email: this.config.email,
      termsOfServiceAgreed: this.config.agreeTerms,
      challengeCreateFn: (authz: Authorization, challenge: Challenge, keyAuthorization: ChallengeKey) => {
        if (challenge.type !== 'dns-01') return;
        return this.cloudflareService.addChallengeRecord(keyAuthorization);
      },
      challengeRemoveFn: (authz: Authorization, challenge: Challenge) => {
        if (challenge.type !== 'dns-01') return;
        return this.cloudflareService.removeChallengeRecord();
      },
      challengePriority: ['dns-01']
    });
    
    await this.gCloudStorage.write('cert', cert.toString());
    await this.gCloudStorage.write('privateKey', key.toString());
    
    return {
      key: key.toString(),
      cert: cert.toString()
    };
  }
  
}
