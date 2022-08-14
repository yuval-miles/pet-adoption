import aws from "aws-sdk";

const s3 = new aws.S3({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string,
  },
  signatureVersion: "v4",
});

export const generateUploadUrl = async (petId: string) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: petId,
    Expires: 60,
  };
  return await s3.getSignedUrlPromise("putObject", params);
};
