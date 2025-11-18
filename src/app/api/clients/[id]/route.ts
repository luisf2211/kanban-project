import { NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await db.delete(clients).where(eq(clients.id, params.id));
  return NextResponse.json({ message: "Cliente eliminado" });
}

function cleanPayload(payload: any) {
  const cleaned: any = {};
  for (const key in payload) {
    const val = payload[key];
    if (val !== undefined && val !== null && val !== "" && !Number.isNaN(val)) {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

export async function PATCH(req: Request, { params }: any) {
  try {
    const id = params.id;
    const body = await req.json();
    const cleaned = cleanPayload(body);

    if (Object.keys(cleaned).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updated = await db
      .update(clients)
      .set(cleaned)
      .where(eq(clients.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (err) {
    console.error("PATCH ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
  