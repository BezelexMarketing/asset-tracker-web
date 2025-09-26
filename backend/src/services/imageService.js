const sharp = require('sharp');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

/**
 * Process and upload image with thumbnail generation
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {string} tenantId - Tenant ID for folder organization
 * @param {string} originalName - Original filename
 * @param {string} category - Image category (item, maintenance, profile, etc.)
 */
const processAndUploadImage = async (imageBuffer, tenantId, originalName, category = 'item') => {
  try {
    const fileId = uuidv4();
    const timestamp = Date.now();
    const extension = path.extname(originalName).toLowerCase() || '.jpg';
    const baseName = `${category}/${tenantId}/${timestamp}-${fileId}`;

    // Process standard image (800px max width, 70% quality)
    const standardImage = await sharp(imageBuffer)
      .resize(800, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: 70 })
      .toBuffer();

    // Process thumbnail (150px max width, 60% quality)
    const thumbnailImage = await sharp(imageBuffer)
      .resize(150, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: 60 })
      .toBuffer();

    // Upload standard image
    const standardKey = `${baseName}-standard${extension}`;
    const standardUpload = await s3.upload({
      Bucket: BUCKET_NAME,
      Key: standardKey,
      Body: standardImage,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
      Metadata: {
        tenantId,
        category,
        originalName,
        imageType: 'standard'
      }
    }).promise();

    // Upload thumbnail
    const thumbnailKey = `${baseName}-thumbnail${extension}`;
    const thumbnailUpload = await s3.upload({
      Bucket: BUCKET_NAME,
      Key: thumbnailKey,
      Body: thumbnailImage,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
      Metadata: {
        tenantId,
        category,
        originalName,
        imageType: 'thumbnail'
      }
    }).promise();

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();

    return {
      id: fileId,
      originalName,
      category,
      standardUrl: standardUpload.Location,
      thumbnailUrl: thumbnailUpload.Location,
      standardKey,
      thumbnailKey,
      size: {
        original: imageBuffer.length,
        standard: standardImage.length,
        thumbnail: thumbnailImage.length
      },
      dimensions: {
        width: metadata.width,
        height: metadata.height
      },
      uploadedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process and upload image');
  }
};

/**
 * Upload multiple images
 * @param {Array} imageFiles - Array of image files with buffer and originalName
 * @param {string} tenantId - Tenant ID
 * @param {string} category - Image category
 */
const uploadMultipleImages = async (imageFiles, tenantId, category = 'item') => {
  try {
    const uploadPromises = imageFiles.map(file => 
      processAndUploadImage(file.buffer, tenantId, file.originalName, category)
    );

    const results = await Promise.all(uploadPromises);
    return results;

  } catch (error) {
    console.error('Multiple image upload error:', error);
    throw error;
  }
};

/**
 * Delete image from S3
 * @param {string} standardKey - Standard image S3 key
 * @param {string} thumbnailKey - Thumbnail image S3 key
 */
const deleteImage = async (standardKey, thumbnailKey) => {
  try {
    const deletePromises = [];

    if (standardKey) {
      deletePromises.push(
        s3.deleteObject({
          Bucket: BUCKET_NAME,
          Key: standardKey
        }).promise()
      );
    }

    if (thumbnailKey) {
      deletePromises.push(
        s3.deleteObject({
          Bucket: BUCKET_NAME,
          Key: thumbnailKey
        }).promise()
      );
    }

    await Promise.all(deletePromises);
    console.log('Images deleted successfully');

  } catch (error) {
    console.error('Image deletion error:', error);
    throw error;
  }
};

/**
 * Get signed URL for private image access
 * @param {string} key - S3 object key
 * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
 */
const getSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: expiresIn
    });

    return url;

  } catch (error) {
    console.error('Signed URL generation error:', error);
    throw error;
  }
};

/**
 * Validate image file
 * @param {Buffer} buffer - Image buffer
 * @param {string} mimetype - File mimetype
 * @param {number} maxSize - Maximum file size in bytes (default: 10MB)
 */
const validateImage = async (buffer, mimetype, maxSize = 10 * 1024 * 1024) => {
  try {
    // Check file size
    if (buffer.length > maxSize) {
      throw new Error(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`);
    }

    // Check mimetype
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed');
    }

    // Validate image using sharp
    const metadata = await sharp(buffer).metadata();
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image file');
    }

    // Check dimensions (max 4000x4000)
    if (metadata.width > 4000 || metadata.height > 4000) {
      throw new Error('Image dimensions too large. Maximum 4000x4000 pixels');
    }

    return {
      valid: true,
      metadata
    };

  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
};

/**
 * Compress image without uploading
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {Object} options - Compression options
 */
const compressImage = async (imageBuffer, options = {}) => {
  try {
    const {
      maxWidth = 800,
      quality = 70,
      format = 'jpeg'
    } = options;

    let pipeline = sharp(imageBuffer)
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });

    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'png':
        pipeline = pipeline.png({ quality });
        break;
      default:
        pipeline = pipeline.jpeg({ quality });
    }

    const compressedBuffer = await pipeline.toBuffer();
    const metadata = await sharp(compressedBuffer).metadata();

    return {
      buffer: compressedBuffer,
      size: compressedBuffer.length,
      dimensions: {
        width: metadata.width,
        height: metadata.height
      },
      format: metadata.format
    };

  } catch (error) {
    console.error('Image compression error:', error);
    throw error;
  }
};

/**
 * Generate image variants for different use cases
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {string} tenantId - Tenant ID
 * @param {string} originalName - Original filename
 */
const generateImageVariants = async (imageBuffer, tenantId, originalName) => {
  try {
    const fileId = uuidv4();
    const timestamp = Date.now();
    const baseName = `variants/${tenantId}/${timestamp}-${fileId}`;

    const variants = {
      thumbnail: { width: 150, quality: 60 },
      small: { width: 300, quality: 70 },
      medium: { width: 600, quality: 75 },
      large: { width: 1200, quality: 80 }
    };

    const uploadPromises = Object.entries(variants).map(async ([size, config]) => {
      const processedImage = await sharp(imageBuffer)
        .resize(config.width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality: config.quality })
        .toBuffer();

      const key = `${baseName}-${size}.jpg`;
      const upload = await s3.upload({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: processedImage,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
        Metadata: {
          tenantId,
          originalName,
          variant: size
        }
      }).promise();

      return {
        size,
        url: upload.Location,
        key,
        fileSize: processedImage.length
      };
    });

    const results = await Promise.all(uploadPromises);
    
    return {
      id: fileId,
      originalName,
      variants: results.reduce((acc, variant) => {
        acc[variant.size] = {
          url: variant.url,
          key: variant.key,
          fileSize: variant.fileSize
        };
        return acc;
      }, {}),
      uploadedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Image variants generation error:', error);
    throw error;
  }
};

module.exports = {
  processAndUploadImage,
  uploadMultipleImages,
  deleteImage,
  getSignedUrl,
  validateImage,
  compressImage,
  generateImageVariants
};