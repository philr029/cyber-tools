/** Deterministic hash for repeatable client-side “generation”. */
function hash32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(seed: number, i: number, arr: readonly T[]): T {
  const idx = (seed + i * 2654435761) % arr.length;
  return arr[idx]!;
}

export function generateBlogTitles(topic: string, audience: string, tone: string, count: number): string[] {
  const t = topic.trim() || "your topic";
  const a = audience.trim() || "readers";
  const toneLabel = tone.trim() || "clear";
  const seed = hash32(`${t}|${a}|${toneLabel}`);
  const patterns = [
    (x: number) => `${t}: what ${a} should know in ${pick(seed, x, ["2026", "this quarter", "the next 90 days"])}`,
    (x: number) => `The ${pick(seed, x, ["practical", "honest", "no-fluff"])} guide to ${t} for ${a}`,
    (x: number) => `${pick(seed, x, ["Why", "How", "When"])} ${t} matters more than you think (${toneLabel} take)`,
    (x: number) => `${t} explained: a ${pick(seed, x, ["fast", "simple", "straightforward"])} playbook for ${a}`,
    (x: number) => `${pick(seed, x, ["5 lessons", "3 mistakes", "7 signals"])} from teams who nailed ${t}`,
    (x: number) => `From zero to confident: ${t} for ${a} (${toneLabel} tone)`,
    (x: number) => `${t} — a ${pick(seed, x, ["checklist", "framework", "decision guide"])} you can reuse`,
    (x: number) => `What ${a} get wrong about ${t} (${pick(seed, x, ["and how to fix it", "with examples", "without hype"])})`,
    (x: number) => `${t}: ${pick(seed, x, ["case study", "deep dive", "starter walkthrough"])} format`,
    (x: number) => `If you only read one piece on ${t}, make it this (${toneLabel}, for ${a})`,
    (x: number) => `${t} in plain English: definitions, tradeoffs, and next steps`,
    (x: number) => `A ${toneLabel} look at ${t} for ${a} who care about outcomes`,
  ];
  const n = Math.min(20, Math.max(1, Math.floor(count) || 5));
  return Array.from({ length: n }, (_, i) => patterns[i % patterns.length]!(i));
}

export function generateSubjectLines(
  emailTopic: string,
  audience: string,
  tone: string,
  offer: string,
): string[] {
  const topic = emailTopic.trim() || "your update";
  const aud = audience.trim() || "subscribers";
  const tn = tone.trim() || "friendly";
  const off = offer.trim() || "see inside";
  const seed = hash32(`${topic}|${aud}|${tn}|${off}`);
  const starters = [
    `${topic} — quick note for ${aud}`,
    `You’ll want to see this: ${topic}`,
    `${pick(seed, 1, ["Last call", "Heads up", "Quick win"])}: ${off}`,
    `A ${tn} take on ${topic}`,
    `${topic} (${pick(seed, 2, ["2 min read", "one link", "no fluff"])})`,
    `For ${aud}: ${topic}`,
    `${topic}: ${off}`,
    `${pick(seed, 4, ["New", "Updated", "Fresh"])} — ${topic}`,
    `Can we talk about ${topic}?`,
    `${topic} + what it means for you`,
  ];
  return starters;
}

export function generateLinkedInPost(topic: string, audience: string, tone: string, goal: string): string {
  const tp = topic.trim() || "your topic";
  const aud = audience.trim() || "leaders";
  const tn = tone.trim() || "professional";
  const g = goal.trim() || "spark discussion";
  const seed = hash32(`${tp}|${aud}|${tn}|${g}`);
  const hook = pick(seed, 0, [
    `I’ve been thinking about ${tp} lately.`,
    `Here’s a ${tn} perspective on ${tp}.`,
    `If you work with ${aud}, ${tp} probably shows up often.`,
  ]);
  const body = pick(seed, 1, [
    `Three things worth separating: the goal, the constraint, and the proof.\n\nFor ${aud}, the hardest part is rarely “more content” — it’s clarity.`,
    `Start with the outcome, then walk backwards to the work. That’s how you avoid busywork and still ${g}.`,
    `The teams that win here tend to do one thing consistently: they ship small learnings in public.\n\nThat builds trust faster than any slide deck.`,
  ]);
  const close = pick(seed, 2, [
    `If this resonates, tell me: what’s your biggest bottleneck around ${tp}?`,
    `What would you add for ${aud}? Drop a comment — I read them all.`,
    `Saving this for later? Follow for more ${tn} notes on growth and execution.`,
  ]);
  return [hook, "", body, "", close].join("\n");
}
