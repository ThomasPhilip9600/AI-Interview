const fs = require('fs');
const path = require('path');
const storageConfig = require('../config/storage');

// Note: If S3 is enabled, import AWS S3 SDK
let S3 = null;
if (storageConfig.isS3) {
  try {
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    S3 = { S3Client, PutObjectCommand };
  } catch (e) {
    console.error('AWS SDK not installed, falling back to local file storage.', e.message);
    storageConfig.isS3 = false;
  }
}

class StorageService {
  /**
   * Upload file to configured storage (S3 or Local)
   * @param {Object} fileMulterObj - File object from Multer
   * @returns {Promise<string>} URL or path of the uploaded file
   */
  static async uploadFile(fileMulterObj) {
    const filename = `${Date.now()}-${fileMulterObj.originalname}`;

    if (storageConfig.isS3 && S3) {
      try {
        const s3Client = new S3.S3Client(storageConfig.s3Settings);
        const fileContent = fs.readFileSync(fileMulterObj.path);
        
        const command = new S3.PutObjectCommand({
          Bucket: storageConfig.bucketName,
          Key: filename,
          Body: fileContent,
          ContentType: fileMulterObj.mimetype
        });

        await s3Client.send(command);
        
        // Remove local temp file uploaded by Multer
        fs.unlinkSync(fileMulterObj.path);

        // Return S3 public URL
        return `https://${storageConfig.bucketName}.s3.${storageConfig.s3Settings.region}.amazonaws.com/${filename}`;
      } catch (err) {
        console.error('S3 upload failed. Falling back to local storage. Error:', err.message);
      }
    }

    // Local file fallback
    const targetPath = path.join(storageConfig.localUploadsDir, filename);
    
    // Copy temporary file to final local upload directory
    fs.copyFileSync(fileMulterObj.path, targetPath);
    try {
      fs.unlinkSync(fileMulterObj.path);
    } catch (e) {
      // Ignore cleanup error of temp file
    }

    // Return relative URL that our Express server will serve statically
    return `/uploads/${filename}`;
  }
}

module.exports = StorageService;
