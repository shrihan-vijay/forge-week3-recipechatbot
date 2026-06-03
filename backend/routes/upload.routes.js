const express = require("express");
const { randomUUID } = require("crypto");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.post("/presigned-url", async (req, res) => {
  const { fileName, fileType } = req.body;

  if (!fileName || !fileType) {
    return res.status(400).json({ message: "fileName and fileType are required" });
  }

  if (!fileType.startsWith("image/")) {
    return res.status(400).json({ message: "Only image files are allowed" });
  }

  try {
    const extension = fileName.split(".").pop();
    const key = `recipes/${randomUUID()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.status(200).json({ uploadUrl, publicUrl });
  } catch (error) {
    console.error("Error creating S3 presigned URL:", error);
    res.status(500).json({ message: "Could not create upload URL" });
  }
});

module.exports = router;