import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";

// GET — Obtener todos los proyectos
export async function GET() {
  const result = await db.select().from(projects).orderBy(projects.created_at);
  return NextResponse.json(result);
}

// POST — Crear un proyecto
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, status, priority } = body;

    if (!name || !status || !priority) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const [inserted] = await db
      .insert(projects)
      .values({
        name,
        description,
        status,
        priority,
      })
      .returning();

    return NextResponse.json(inserted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
