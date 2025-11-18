import { NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";

export async function GET() {
  const result = await db.select().from(clients).orderBy(clients.created_at);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const body = await req.json();

  const newClient = await db.insert(clients).values({
    name: body.name,
    type: body.type,
    value: body.value,
    date_from: body.date_from,
    date_to: body.date_to,
  }).returning();

  return NextResponse.json(newClient[0]);
}
