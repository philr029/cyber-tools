import { NextRequest, NextResponse } from "next/server";
import { resolve4 } from "node:dns/promises";

interface MxToolboxBlacklistResponse {
  Failed: { Name: string; Info: string }[];
  Passed: { Name: string; Info: string }[];
  // Additional fields omitted — only Failed/Passed are needed.
}

interface InstantlyCampaignResponse {
  status?: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel's cron scheduler.
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mxToolboxApiKey = process.env.MX_TOOLBOX_API_KEY;
  const instantlyApiKey = process.env.INSTANTLY_API_KEY;
  const campaignId = process.env.CAMPAIGN_ID;
  const domain = process.env.MONITORED_DOMAIN;

  if (!mxToolboxApiKey || !instantlyApiKey || !campaignId || !domain) {
    return NextResponse.json(
      { error: "Missing required environment variables." },
      { status: 500 },
    );
  }

  // --- Step 1: Resolve the sending domain's A record to its IPv4 address ---
  // MxToolbox returns only ~5 lists when queried by domain name. Querying by IP
  // address unlocks the full 202-list coverage.
  let sendingIp: string;
  try {
    const addresses = await resolve4(domain);
    sendingIp = addresses[0];
    console.log(`Resolved "${domain}" → ${sendingIp}`);
  } catch (err) {
    console.error(`DNS A-record lookup failed for "${domain}":`, err);
    return NextResponse.json(
      { error: `DNS A-record lookup failed for "${domain}".` },
      { status: 500 },
    );
  }

  // --- Step 2: Query MX Toolbox blacklist endpoint using the resolved IP ---
  let blacklistData: MxToolboxBlacklistResponse;
  try {
    const mxRes = await fetch(
      `https://api.mxtoolbox.com/api/v1/lookup/blacklist/${encodeURIComponent(sendingIp)}`,
      {
        headers: { Authorization: mxToolboxApiKey },
      },
    );

    if (!mxRes.ok) {
      const errorText = await mxRes.text();
      console.error(`MX Toolbox API error (${mxRes.status}): ${errorText}`);
      return NextResponse.json(
        { error: "MX Toolbox API request failed.", details: errorText },
        { status: 502 },
      );
    }

    blacklistData = (await mxRes.json()) as MxToolboxBlacklistResponse;
  } catch (err) {
    console.error("Failed to reach MX Toolbox API:", err);
    return NextResponse.json(
      { error: "Failed to reach MX Toolbox API." },
      { status: 502 },
    );
  }

  const failedCount = blacklistData.Failed?.length ?? 0;
  const passedCount = blacklistData.Passed?.length ?? 0;
  const totalCount = passedCount + failedCount;

  console.log(`Status: ${passedCount}/${totalCount} Passed (IP: ${sendingIp})`);

  if (failedCount === 0) {
    console.log(`IP "${sendingIp}" (${domain}) is clean. No action required.`);
    return NextResponse.json({
      status: "clean",
      message: `IP "${sendingIp}" for domain "${domain}" passed all ${totalCount} checks.`,
      domain,
      ip: sendingIp,
      passed: passedCount,
      failed: failedCount,
    });
  }

  // --- Step 3: IP is blacklisted — pause the Instantly campaign ---
  const flaggedLists = blacklistData.Failed.map((f) => f.Name);
  console.warn(
    `IP "${sendingIp}" (${domain}) is listed on ${failedCount} blacklist(s): ${flaggedLists.join(", ")}`,
  );

  let campaignResponse: InstantlyCampaignResponse;
  try {
    const instantlyRes = await fetch(
      `https://api.instantly.ai/api/v2/campaigns/${encodeURIComponent(campaignId)}/pause`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${instantlyApiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (instantlyRes.status === 409) {
      // 409 Conflict: the campaign is already in a paused state — idempotent skip.
      console.log(`Campaign "${campaignId}" is already paused. Skipping.`);
      return NextResponse.json({
        status: "already_paused",
        message: "Campaign was already paused.",
        domain,
        ip: sendingIp,
        passed: passedCount,
        failed: failedCount,
        flaggedLists,
      });
    }

    if (!instantlyRes.ok) {
      const errorText = await instantlyRes.text();
      console.error(
        `Instantly API error (${instantlyRes.status}): ${errorText}`,
      );
      return NextResponse.json(
        { error: "Instantly API request failed.", details: errorText },
        { status: 502 },
      );
    }

    campaignResponse = (await instantlyRes.json()) as InstantlyCampaignResponse;
  } catch (err) {
    console.error("Failed to reach Instantly API:", err);
    return NextResponse.json(
      { error: "Failed to reach Instantly API." },
      { status: 502 },
    );
  }

  // Defensive fallback: some Instantly API versions return 200 with a "paused"
  // status body instead of 409 when the campaign is already paused.
  if (
    campaignResponse.status === "paused" ||
    campaignResponse.status === "already_paused"
  ) {
    console.log(`Campaign "${campaignId}" is already paused. Skipping.`);
    return NextResponse.json({
      status: "already_paused",
      message: "Campaign was already paused.",
      domain,
      ip: sendingIp,
      passed: passedCount,
      failed: failedCount,
      flaggedLists,
    });
  }

  console.log(`Campaign "${campaignId}" paused successfully.`);
  return NextResponse.json({
    status: "paused",
    message: `Campaign paused. IP "${sendingIp}" for domain "${domain}" is listed on ${failedCount} blacklist(s).`,
    domain,
    ip: sendingIp,
    passed: passedCount,
    failed: failedCount,
    flaggedLists,
  });
}
