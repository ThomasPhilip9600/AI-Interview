const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

// Ensure local uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storageConfig = {
  isS3: !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET
  ),
  bucketName: process.env.AWS_S3_BUCKET || '',
  s3Settings: {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    },
    region: process.env.AWS_REGION || 'us-east-1'
  },
  localUploadsDir: UPLOADS_DIR
};

if (storageConfig.isS3) {
  console.log('Storage Config: AWS S3 is enabled.');
} else {
  console.log(`Storage Config: Using local filesystem for file uploads (path: ${UPLOADS_DIR}).`);
}

module.exports = storageConfig;
