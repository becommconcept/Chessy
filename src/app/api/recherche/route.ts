import { NextRequest, NextResponse } from "next/server";

import { search } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  if (query.trim().length < 2) {
    return NextResponse.json({ results: [], query });
  }

  const results = await search(query, 12);
  return NextResponse.json({ results, query });
}
