import {Container, Service} from 'typedi';
import {ConfigService} from './configService';
import {CloudflareApi, ICloudflareResourceZone} from '../types/cloudflare';
import * as cloudflare from 'cloudflare';
import * as dns from "dns";
import {flatten} from '../helpers';

@Service()
export class CloudflareService {
  private config: ConfigService;
  private cf: CloudflareApi;
  private primaryZone: ICloudflareResourceZone;
  private challengeData: string;
  
  constructor() {
    this.config = Container.get(ConfigService);
    if (this.config && this.config.cloudflare) {
      this.cf = cloudflare({
        email: this.config.cloudflare.email,
        key: this.config.cloudflare.apiKey
      });
    }
  }
  
  async getZone(): Promise<ICloudflareResourceZone> {
    if (!this.primaryZone) {
      return (await this.cf.zones.browse({
        page: 1,
        per_page: 1000
      })).result.find(el => el.name.includes(this.config.getParentDomain()));
    }
    return this.primaryZone;
  }
  
  async removeChallengeRecord(): Promise<void> {
    const zoneId = (await this.getZone()).id;
    const findRecord = (await this.cf.dnsRecords.browse(zoneId, {
      page: 1,
      per_page: 1000
    })).result.find(el => el.type === 'TXT' && el.name.includes('_acme-challenge'));
    if (findRecord) {
      await this.cf.dnsRecords.del(zoneId, findRecord.id);
    }
  }
  
  locallyVerifyTxtRecord(count = 0) {
    return new Promise((resolve) => {
      dns.resolveTxt(`_acme-challenge.${this.config.domain}`, (err, addresses) => {
        // if (err) console.error(err);
        const values = flatten(addresses, 2);
        if (values.find(el => el.includes(this.challengeData))) {
          console.log('domain verified!', values);
          resolve();
        } else {
          setTimeout(async () => {
            console.log('(' + count + ') verifying acme challenge...');
            resolve((await this.locallyVerifyTxtRecord(count + 1)));
          }, 8000);
        }
      });
    })
  };
  
  addChallengeRecord(data: string) {
    this.challengeData = data;
    return new Promise(async (resolve) => {
      console.log('adding _acme-challenge DNS record...');
      await this.cf.dnsRecords.add((await this.getZone()).id, {
        type: 'TXT',
        name: `_acme-challenge.${this.config.domain}`,
        content: this.challengeData,
        proxied: false,
        ttl: 1
      });
      //this.locallyVerifyTxtRecord().then(() => resolve());
      setTimeout(() => resolve(), 60000);
    })
  }
  
}
