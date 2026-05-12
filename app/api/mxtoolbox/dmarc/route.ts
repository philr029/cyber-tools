import type { NextRequest } from "next/server";
import { mxToolboxRouteGET } from "../_mx-route";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  return mxToolboxRouteGET(request, "dmarc", "domain");
}
