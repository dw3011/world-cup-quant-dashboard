import { NextResponse } from "next/server";
import { mockMatches } from "@/data/mockMatches";
import { predictionFor } from "@/lib/models/probability";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const match = mockMatches.find((item) => item.id === body.match_id) ?? mockMatches[0];
  return NextResponse.json(predictionFor(match));
}
