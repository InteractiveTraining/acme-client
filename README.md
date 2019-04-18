# acme-client
Simple scalable automatic solution for obtaining SSL certificates.

## Example
```typescript
import * as https from 'https';
import {AcmeClient} from '@interactivetraining/acme-client';

new AcmeClient({
  domain: 'my-domain.com',
  email: 'support@my-domain.com',
  googleCloud: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    bucketName: process.env.GOOGLE_CLOUD_SSL_BUCKET_NAME,
    credentials: {
      email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      privateKey: process.env.GOOGLE_CLOUD_CLIENT_PRIVATE_KEY
    }
  },
  cloudflare: {
    email: process.env.CLOUDFLARE_EMAIL,
    apiKey: process.env.CLOUDFLARE_API_KEY
  },
  fileNames: {
    cert: 'my-domain-prod-cert.pem',
    caCert: 'my-domain-prod-caCert.pem',
    privateKey: 'my-domain-prod-private-key.pem',
    accountKey: 'my-domain-prod-account-key.pem'
  },
  acmeServer: 'prod',
  agreeTerms: true
}).getCert().then((res) => {
  https.createServer({
    cert: res.cert,
    key: res.key
  }, () => {
    
  });
});
```
