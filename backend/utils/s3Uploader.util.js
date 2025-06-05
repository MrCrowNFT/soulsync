import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

export const uploadImageToS3 = async (file) => {
  try {
    //input validation
    if (!file || !file.buffer || !file.originalname || !file.mimetype) {
      throw new Error("Invalid file object");
    }

    // type validation
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]; //->should be a constant
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(
        `Invalid file type: ${
          file.mimetype
        }. Allowed types: ${allowedTypes.join(", ")}`
      );
    }

    // size validation
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes ->should be a constant
    if (file.buffer.length > maxSize) {
      throw new Error(
        `File too large: ${file.buffer.length} bytes. Max size: ${maxSize} bytes`
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

    // url construction
    const region = process.env.AWS_REGION || "us-east-1";
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${region}.amazonaws.com/${filename}`;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload image to S3");
  }
};
