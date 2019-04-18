export interface ICloudflarePagination {
  page: number;
  per_page: number;
}

export interface ICloudflareResultInfo {
  page: number;
  per_page: number;
  total_pages: number;
  count: number;
  total_count: number;
}

export interface ICloudflareResponse<Resource> {
  result: Resource;
  result_info?: ICloudflareResultInfo;
  success: boolean;
  errors: any[];
  messages: any[];
}


export interface ICloudflareResourceZone {
  id: string;
  name: string;
  status: string;
  paused: boolean;
  type: string;
  development_mode: number;
  
  // TODO name_servers
  name_servers: any[];
  
  // TODO original_name_servers
  original_name_servers: any[];
  
  // TODO original_registrar
  original_registrar: any;
  
  // TODO original_dnshost
  original_dnshost: any;
  
  modified_on: Date;
  created_on: Date;
  activated_on: Date;
  
  // TODO meta
  meta: any;
  
  // TODO owner
  owner: any;
  
  // TODO account
  account: any;
  
  // TODO permissions
  permissions: any[];
  
  // TODO plan
  plan: any;
}

export declare class CloudflareZones {
  browse: (pagination?: Partial<ICloudflarePagination>) => Promise<ICloudflareResponse<ICloudflareResourceZone[]>>;
}

export interface ICloudflareResourceDnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  proxiable: boolean;
  proxied: boolean;
  ttl: number;
  locked: boolean;
  zone_id: string;
  zone_name: string;
  modified_on: Date;
  created_on: Date;
  
  // TODO meta
  meta: any;
}

export interface ICloudflareDeleteResource {
  id: string;
}

export declare class CloudflareDnsRecords {
  browse: (zoneId: string, pagination?: Partial<ICloudflarePagination>) => Promise<ICloudflareResponse<ICloudflareResourceDnsRecord[]>>;
  del: (zoneId: string, dnsRecordId: string) => Promise<ICloudflareResponse<ICloudflareDeleteResource>>;
  add: (zoneId: string, record: Partial<ICloudflareResourceDnsRecord>) => Promise<ICloudflareResponse<ICloudflareResourceDnsRecord>>;
}

export declare class CloudflareApi {
  zones: CloudflareZones;
  dnsRecords: CloudflareDnsRecords;
}

export declare function cloudflare(credentials: { email: string, key: string }): CloudflareApi;
