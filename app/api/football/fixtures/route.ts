import { NextResponse } from "next/server";
import { ApiFootballConfigError, apiFootballMissingKeyResponse, apiFootballRequest } from "@/lib/football/apiFootballClient";

export const dynamic = "force-dynamic";

type ApiFootballFixture = {
  fixture?: {
    id?: number;
    date?: string;
    status?: {
      short?: string;
    };
  };
  teams?: {
    home?: {
      name?: string;
    };
    away?: {
      name?: string;
    };
  };
  goals?: {
    home?: number | null;
    away?: number | null;
  };
  league?: {
    name?: string;
    round?: string;
    season?: number;
  };
};

type ApiFootballFixturesResponse = {
  response?: ApiFootballFixture[];
  [key: string]: unknown;
};

function logFixturePreview(data: ApiFootballFixturesResponse) {
  const preview = (data.response ?? []).slice(0, 10).map((item) => ({
    fixture_id: item.fixture?.id,
    fixture_date: item.fixture?.date,
    status_short: item.fixture?.status?.short,
    home_team: item.teams?.home?.name,
    away_team: item.teams?.away?.name,
    goals_home: item.goals?.home,
    goals_away: item.goals?.away,
    league_name: item.league?.name,
    league_round: item.league?.round,
    league_season: item.league?.season
  }));

  console.log("[api-football fixtures preview]", preview);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const data = await apiFootballRequest<ApiFootballFixturesResponse>("/fixtures", {
      date: searchParams.get("date"),
      league: searchParams.get("league"),
      season: searchParams.get("season"),
      live: searchParams.get("live")
    });

    logFixturePreview(data);
    return NextResponse.json(data, { headers: { "x-module-status": "experimental-optional" } });
  } catch (error) {
    if (error instanceof ApiFootballConfigError) {
      const data = apiFootballMissingKeyResponse();
      console.log("[api-football fixtures preview]", []);
      return NextResponse.json(data, { status: 200, headers: { "x-module-status": "experimental-optional" } });
    }

    return NextResponse.json(
      { errors: { server: "API-Football fixtures request failed" }, response: [] },
      { status: 500, headers: { "x-module-status": "experimental-optional" } }
    );
  }
}
