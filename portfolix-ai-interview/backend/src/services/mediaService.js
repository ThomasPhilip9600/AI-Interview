const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

class MediaService {
  /**
   * Extract audio from WebM video file.
   * @param {string} videoPath - Relative or absolute path to the local video file.
   * @returns {Promise<string|null>} Path to the extracted audio file, or null if failed/FFmpeg missing.
   */
  static extractAudio(videoPath) {
    return new Promise((resolve) => {
      // If the videoPath is a URL (e.g. S3), we might not be able to easily extract audio locally 
      // without downloading it first. If it starts with http, we'll download it or skip it.
      // For local testing, videoPath is usually a local path like /uploads/filename.webm.
      let localVideoPath = videoPath;
      
      if (videoPath.startsWith('/uploads/')) {
        localVideoPath = path.join(__dirname, '..', '..', videoPath);
      } else if (videoPath.startsWith('http')) {
        // For S3 uploads, we can skip local extraction to avoid downloading overhead,
        // or download it. Let's skip to keep it cost-efficient and lightweight.
        console.log('MediaService: Video stored on S3. Skipping local audio extraction.');
        return resolve(null);
      }

      if (!fs.existsSync(localVideoPath)) {
        console.error(`MediaService: Video file does not exist at path: ${localVideoPath}`);
        return resolve(null);
      }

      const audioFilename = `${path.basename(localVideoPath, path.extname(localVideoPath))}.mp3`;
      const audioOutputPath = path.join(path.dirname(localVideoPath), audioFilename);

      console.log(`MediaService: Extracting audio from ${localVideoPath} to ${audioOutputPath}...`);

      ffmpeg(localVideoPath)
        .toFormat('mp3')
        .noVideo()
        .on('end', () => {
          console.log('MediaService: Audio extraction completed successfully.');
          // Return the relative URL of the audio file
          const relativeAudioUrl = `/uploads/${audioFilename}`;
          resolve(relativeAudioUrl);
        })
        .on('error', (err) => {
          console.warn('MediaService: FFmpeg audio extraction failed (likely FFmpeg is not installed on this machine). Proceeding without audio extraction. Error:', err.message);
          resolve(null);
        })
        .save(audioOutputPath);
    });
  }
}

module.exports = MediaService;
