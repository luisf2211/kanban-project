import { NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  await db.delete(clients).where(eq(clients.id, id));

  return NextResponse.json({ message: "Cliente eliminado" });
}

function cleanPayload(payload: any) {
  const cleaned: any = {};
  for (const key in payload) {
    const val = payload[key];

    if (val === undefined || val === null || val === "") continue;

    // Drizzle NO acepta numbers si la columna es string/text
    if (key === "value") {
      cleaned[key] = String(val);
      continue;
    }

    cleaned[key] = val;
  }

  return cleaned;
}

// ---------------------
// PATCH
// ---------------------
export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
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
