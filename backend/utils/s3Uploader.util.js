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
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(params));
    return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${filename}`;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload image to S3");
  }
};
