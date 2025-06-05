import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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

export const uploadImageToS3 = async (file) => {
  try {
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

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));

    const region = process.env.AWS_REGION || "us-east-1";
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${region}.amazonaws.com/${filename}`;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw error; // rethrow error
  }
};
