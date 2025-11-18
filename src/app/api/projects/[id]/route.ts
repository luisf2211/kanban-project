import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";

// PATCH — actualizar proyecto (incluye mover columna)
export async function PATCH(req: Request, { params }: any) {
  try {
    const { id } = params;
    const updates = await req.json();

    const [updated] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error updating" }, { status: 500 });
  }
}

// DELETE — borrar proyecto
export async function DELETE(req: Request, { params }: any) {
  try {
    const { id } = params;

    await db.delete(projects).where(eq(projects.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error deleting" }, { status: 500 });
  }
}
