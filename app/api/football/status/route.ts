import { NextResponse } from "next/server";
import { ApiFootballConfigError, apiFootballMissingKeyResponse, apiFootballRequest } from "@/lib/football/apiFootballClient";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await apiFootballRequest("/status");
    return NextResponse.json(data, { headers: { "x-module-status": "experimental-optional" } });
  } catch (error) {
    if (error instanceof ApiFootballConfigError) {
      return NextResponse.json(apiFootballMissingKeyResponse(), { status: 200, headers: { "x-module-status": "experimental-optional" } });
    }

    return NextResponse.json({ errors: { server: "API-Football status request failed" }, response: [] }, { status: 500, headers: { "x-module-status": "experimental-optional" } });
  }
}
