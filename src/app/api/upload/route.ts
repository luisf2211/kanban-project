import { NextResponse } from "next/server";
import { db } from "@/db";
import { files } from "@/db/schema";
import { uploadToS3 } from "@/lib/s3";

export async function GET() {
  const allFiles = await db.select().from(files).orderBy(files.created_at);
  return NextResponse.json(allFiles);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    const description = form.get("description")?.toString() ?? "";
    const name = form.get("name")?.toString() ?? file?.name ?? "archivo";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}_${file.name}`;
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "unknown";

    const storage_url = await uploadToS3(buffer, fileName, file.type);

    const [inserted] = await db
      .insert(files)
      .values({
        name,
        description,
        file_type: extension,
        storage_url,
      })
      .returning();

    return NextResponse.json(inserted);
  } catch (err) {
    console.error("UPLOAD ERROR", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
