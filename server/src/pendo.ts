import type { Request } from "express";

// Server-side Pendo Track Events, sent to the Pendo Track API over HTTP.
// The integration key is read from the environment and never committed.
// When it is not set, tracking is skipped so local dev keeps working.
const PENDO_DATA_HOST = process.env.PENDO_DATA_HOST ?? "data.pendo-dev.pendo-dev.com";
const PENDO_TRACK_EVENT_SECRET = process.env.PENDO_TRACK_EVENT_SECRET;

// The web client sends its anonymous Pendo visitor and account IDs in these
// headers so server events are linked to the same visitor and account.
const VISITOR_HEADER = "x-pendo-visitor-id";
const ACCOUNT_HEADER = "x-pendo-account-id";

export interface PendoIdentity {
  visitorId: string;
  accountId: string;
}

// Falls back to "system" only when the request carries no visitor or account ID.
export function pendoIdentity(req: Request): PendoIdentity {
  return {
    visitorId: req.get(VISITOR_HEADER) || "system",
    accountId: req.get(ACCOUNT_HEADER) || "system",
  };
}

// Fire-and-forget: tracking failures are logged and never break the request.
export function pendoTrack(
  event: string,
  identity: PendoIdentity,
  properties: Record<string, string | number | boolean> = {}
): void {
  if (!PENDO_TRACK_EVENT_SECRET) return;

  fetch(`https://${PENDO_DATA_HOST}/data/track`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-pendo-integration-key": PENDO_TRACK_EVENT_SECRET,
    },
    body: JSON.stringify({
      type: "track",
      event,
      visitorId: identity.visitorId,
      accountId: identity.accountId,
      timestamp: Date.now(),
      properties,
    }),
  })
    .then((res) => {
      if (!res.ok) console.error(`Pendo track "${event}" failed: ${res.status}`);
    })
    .catch((e: unknown) => {
      console.error(`Pendo track "${event}" failed:`, e);
    });
}
