import { NextResponse } from "next/server";
import { db } from "@/db";
import { files } from "@/db/schema";
import { eq } from "drizzle-orm";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(_: Request, { params }: any) {
  const { id } = params;

  const [file] = await db.select().from(files).where(eq(files.id, id));

  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const key = file.storage_url.split(".com/")[1];

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 mins

  return NextResponse.json({ url: signedUrl });
}
