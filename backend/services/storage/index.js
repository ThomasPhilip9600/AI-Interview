const Minio = require('minio');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'interviews';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

/**
 * Initializes the storage bucket if it doesn't exist
 */
async function initializeStorage() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`Bucket ${BUCKET_NAME} created successfully.`);
    }
  } catch (error) {
    console.error('Error initializing MinIO bucket:', error);
  }
}

// Call init once
initializeStorage();

/**
 * Uploads a local file to MinIO storage
 * @param {string} filePath - Path to the local file
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File mime type
 * @returns {Promise<string>} - The unique object key used in MinIO
 */
async function uploadFile(filePath, originalName, mimeType) {
  const extension = originalName.split('.').pop() || 'mp4';
  const objectKey = `${uuidv4()}.${extension}`;
  
  const metaData = {
    'Content-Type': mimeType,
  };

  await minioClient.fPutObject(BUCKET_NAME, objectKey, filePath, metaData);
  return objectKey;
}

/**
 * Gets a presigned URL for secure access to a file
 * @param {string} objectKey - MinIO object key
 * @returns {Promise<string>} - The presigned URL
 */
async function getPresignedUrl(objectKey) {
  if (!objectKey) return null;
  // Expiry time of 1 hour (3600 seconds)
  return await minioClient.presignedGetObject(BUCKET_NAME, objectKey, 3600);
}

/**
 * Permanently removes an object from MinIO
 * @param {string} objectKey - MinIO object key
 */
async function removeFile(objectKey) {
  if (!objectKey) return;
  await minioClient.removeObject(BUCKET_NAME, objectKey);
}

/**
 * Downloads a file from MinIO to a local path
 * @param {string} objectKey - MinIO object key
 * @param {string} localPath - Local file path to save it
 */
async function downloadFileLocally(objectKey, localPath) {
  if (!objectKey) return;
  await minioClient.fGetObject(BUCKET_NAME, objectKey, localPath);
}

module.exports = {
  uploadFile,
  getPresignedUrl,
  removeFile,
  downloadFileLocally
};
