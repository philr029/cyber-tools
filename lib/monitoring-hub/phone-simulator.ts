/**
 * Placeholder phone probe — replace `simulatePhoneTest` with a Twilio status
 * callback poller or `twilio.calls.create` + TwiML when `TWILIO_ACCOUNT_SID`,
 * `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER` are configured for production
 * outbound test calls (see also `app/api/tools/phone-test/route.ts`).
 */

export type SimulatedCallOutcome =
  | "connected"
  | "failed"
  | "no_answer"
  | "busy"
  | "error";

export interface SimulatedPhoneResult {
  outcome: SimulatedCallOutcome;
  durationSec: number;
  notes: string;
}

/** Deterministic pseudo-random outcome from E.164 number for demos. */
export function simulatePhoneTest(e164: string): SimulatedPhoneResult {
  const sum = [...e164].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const roll = sum % 5;
  const durationSec = (sum % 45) + 1;
  switch (roll) {
    case 0:
      return { outcome: "connected", durationSec, notes: "Simulated: callee picked up (placeholder)." };
    case 1:
      return { outcome: "no_answer", durationSec: 0, notes: "Simulated: rang out (placeholder)." };
    case 2:
      return { outcome: "busy", durationSec: 0, notes: "Simulated: busy signal (placeholder)." };
    case 3:
      return { outcome: "failed", durationSec: 0, notes: "Simulated: carrier rejected (placeholder)." };
    default:
      return { outcome: "error", durationSec: 0, notes: "Simulated: API error path (placeholder)." };
  }
}
