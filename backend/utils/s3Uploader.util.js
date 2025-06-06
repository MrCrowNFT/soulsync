import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

// Constants
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const extractKeyFromUrl = (url) => {
  try {
    if (!url) return null;

    // handle both S3 and CloudFront urls
    let key;
    if (url.includes(".cloudfront.net/")) {
      // cloudFront url
      const urlParts = url.split(".cloudfront.net/");
      if (urlParts.length < 2) return null;
      key = urlParts[1];
    } else if (url.includes(".amazonaws.com/")) {
      // s3 url
      const urlParts = url.split(".amazonaws.com/");
      if (urlParts.length < 2) return null;
      key = urlParts[1];
    } else {
      return null;
    }

    if (!key.startsWith("profile-pictures/")) {
      key = `profile-pictures/${key}`;
    }
    return key;
  } catch (error) {
    console.error("Error extracting key from URL:", error);
    return null;
  }
};

export const uploadImageToS3 = async (file, oldPhotoUrl = null) => {
  try {
    // Validate environment variables
    const requiredEnvVars = [
      "AWS_BUCKET_NAME",
      "AWS_REGION",
      "AWS_ACCESS_KEY",
      "AWS_SECRET_KEY",
      "CLOUDFRONT_DOMAIN_NAME",
    ];
    const missingEnvVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(", ")}`
      );
    }

    // input validation
    if (!file || !file.buffer || !file.originalname || !file.mimetype) {
      throw new Error("Invalid file object");
    }

    // type validation
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new Error(
        `Invalid file type: ${
          file.mimetype
        }. Allowed types: ${ALLOWED_TYPES.join(", ")}`
      );
    }

    // size validation
    if (file.buffer.length > MAX_FILE_SIZE) {
      throw new Error(
        `File too large: ${file.buffer.length} bytes. Max size: ${MAX_FILE_SIZE} bytes`
      );
    }

    //delete the old photo if exists
    if (oldPhotoUrl) {
      try {
        const oldKey = extractKeyFromUrl(oldPhotoUrl);
        if (oldKey) {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: oldKey,
            })
          );
        }
      } catch (deleteError) {
        console.warn("Failed to delete old photo:", deleteError.message);
      }
    }

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `profile-pictures/${filename}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));

    // Return CloudFront URL instead of S3 URL
    const cloudFrontUrl = process.env.CLOUDFRONT_DOMAIN_NAME;
    return `https://${cloudFrontUrl}/profile-pictures/${filename}`;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw error;
  }
};
