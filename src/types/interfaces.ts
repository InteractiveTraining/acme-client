export interface IConfig {
  acmeServer: 'prod' | 'staging';
  domain: string;
  email: string;
  cloudflare: ICloudflareConfig;
  googleCloud: IGoogleCloudConfig;
  fileNames: IFileNameConfig;
  agreeTerms: boolean;
}

export interface ICloudflareConfig {
  email: string;
  apiKey: string;
}

export interface IGoogleCloudConfig {
  projectId: string;
  bucketName: string;
  credentials: IGoogleCloudCredentialsConfig;
}

export interface IGoogleCloudCredentialsConfig {
  email: string;
  privateKey: string;
}

export interface IFileNameConfig {
  cert: string;
  privateKey: string;
  accountKey: string;
}

export type TFileName = 'cert' | 'caCert' | 'privateKey' | 'accountKey';
