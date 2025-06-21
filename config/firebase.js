import dotenv from 'dotenv';
dotenv.config();

import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDpoEXaYX+miug1\nnvrqE8gGKBZR1sorHWfB6ciQLzla/C8zDVOUfX2qGB3GGZIQMdZGdl/PYgLEzxRV\n0WAOu12kjTiReNBFiidRRvWcg6Y3Mi0fTpk51FStSshqT8HzCE+OoxfiFsAnj0Ok\n/0ZscyVmnIQ3bBtHDrp+ZEVp80ZXbeDanMAo0hANFgleYtE1rf4oFYEHQ19tfVc+\nwO2TosTKpQMmMVp8vWeryqOBq9esw9/xfz407gzAi2rLrPHOL+0HPR73XcSN14h8\nHRYWKMnEqsalAiVE5FUniWeDCXoxtI7Iwf6W81PgUqYJkPKuTLRaP8vVWr9Pa1c4\nPJVhn5cBAgMBAAECggEAAj+n4ChNDsYa71nODLcV7KDV5FCigAeVOJ5Oo5toI71p\nFsnO1/URdnIx866CCxCUP6KNokvNVbz+xUqIzDuAkrL3U6Al4npjF5He5IF1HU9a\nMsEFP94xgOprLEjv4dwdKB+dYuanq5dYQ53B575lhQRe2e3qrjgtbmBp4A+gbfrT\n05WxrhGASmZFLdNLafAjfYXp3g+j1UJcSv2aTMClmV1ZA2H6gg6jWmeRBcT21wtb\nIS9zPj/l1noO+Vz9MSuj5MjP/pyDECm20v2QmmLXwgNyRf0kzXXFLhG7lOM5Ftw2\nhD1LTeR8+T8qU4i6Rk3fiYHauCCKzR9BijCWZTGf/QKBgQD1DU4NMQVa0aLHAdmQ\npt8dNnAWhsw8xVjLUJclDHbDYrnkvhbDw6atvXNV/oyy66W7+mwXLHYx1Qsx/PMO\nHZUdT8vQVzs3+2ZxbIDVFu+vlPOfeKKDE0LN3g/pkX7zbiW1Lf9UPJP1u1nVdgb8\nxDyDjGK/UmwWmqzSIm+Js48cLwKBgQD0EEnIuC0cIFKpWnCLcxyiz6xCxXMRZHS1\noXNHLpNJ8So+q7x/60/IZiMhWQYmjRdOURS/Yq8Iy0NnFtBJcC+yRZ2CGVD6VQBA\nc4xvYujFd2SULWP8FhfLQyGOfLfwAinHaHNzxSvO0zJTVhRbGbxnICbnDpxtkbmu\n1zrE7JDDzwKBgFv5sG/3FEFwKZ50LUrDtz5prkxmL8YndBprly9KrFDNf2RBjJ3R\nk3/meaGvNvP4ym3xohxYjcxKYDdU740+wTcNOjxqYUmzzFGKHhjc0P2f9IjIaIa1\n9f76+BH8kB+iGfkU2J6vVgGHXkJmWF0K8oOVb4LL1tHtICyGzEJs6Kv1AoGAYZit\n2K0FpOysAXrf7HOwrM585QqOFBNmtEcGkR1n2rasnPkR3NldQxbMz4YI9puPCUtV\nD59HvS2DG5M84VESUaiS7rZu8lvRSPSr4NLdoDE5MCPiiqjPBQIoRhFLgJds24fC\nOzZKaV99DWQrqa5l75sk01q9ZPdUGD2LC7pJvXMCgYA6zmhuCps9slxLw3G++Ccf\nTpDffMgy5po0YWOt51yeX0sEUgTSBRfKLofByN0zB4LCvpg9tnpbBsxivuaqEXnf\nSCQyz45jjUZFTx7n0aJuKaA7NN8jvQ+haoDpvtBxvIfdA3EKVEH7XLsJZ5LB9ofB\nDviWBmDCnkIl0fBf0q05Tg==\n-----END PRIVATE KEY-----\n",
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'cloudtasker-bdfcb'
});

const messaging = admin.messaging();

export { admin, messaging }; 