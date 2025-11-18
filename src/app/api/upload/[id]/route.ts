import { NextResponse } from "next/server";
import { db } from "@/db";
import { files } from "@/db/schema";
import { eq } from "drizzle-orm";
import { s3 } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function DELETE(_: Request, { params }: any) {
  try {
    const { id } = params;

    const [file] = await db.select().from(files).where(eq(files.id, id));

    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const key = file.storage_url.split(".com/")[1];

    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
      })
    );

    await db.delete(files).where(eq(files.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
