import {AcmeClient} from './index';

jest.setTimeout((1000 * 60 * 5));

describe('e2e', () => {
  
  it('can get key/cert', async (done) => {
    const acme = await new AcmeClient({
      domain: process.env.DOMAIN,
      email: process.env.LETS_ENCRYPT_EMAIL,
      googleCloud: {
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        bucketName: process.env.GOOGLE_CLOUD_SSL_BUCKET_NAME,
        credentials: {
          email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
          privateKey: process.env.GOOGLE_CLOUD_PRIVATE_KEY
        }
      },
      cloudflare: {
        email: process.env.CLOUDFLARE_EMAIL,
        apiKey: process.env.CLOUDFLARE_API_KEY
      },
      fileNames: {
        cert: `${process.env.FILENAME_PREFIX}-cert.pem`,
        privateKey: `${process.env.FILENAME_PREFIX}-private-key.pem`,
        accountKey: `${process.env.FILENAME_PREFIX}-account-key.pem`
      },
      acmeServer: 'staging',
      agreeTerms: true
    }).getCert();
    
    expect(acme.cert).toBeDefined();
    expect(acme.cert.length).toBeGreaterThan(50);
    
    expect(acme.key).toBeDefined();
    expect(acme.key.length).toBeGreaterThan(50);
    
    done();
  });
});
