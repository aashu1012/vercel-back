import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Initialize Firebase Admin SDK
const serviceAccount = require('./cloudtasker-bdfcb-firebase-adminsdk-fbsvc-a41846fec6.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'cloudtasker-bdfcb'
});

const messaging = admin.messaging();

export { admin, messaging }; 