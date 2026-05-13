// =============================================================================
// Text generators for Day-to-Day Tools — keyed by `templateId` in the catalog.
// Future: optional server-side AI rewrite via a Route Handler (API keys only on server).
// =============================================================================

export interface GeneratorField {
  id: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
}

export interface GeneratorTemplate {
  id: string;
  title: string;
  fields: GeneratorField[];
  build: (values: Record<string, string>) => string;
}

function val(v: Record<string, string>, id: string, fallback = ""): string {
  return (v[id] ?? "").trim() || fallback;
}

export const GENERATOR_TEMPLATES: Record<string, GeneratorTemplate> = {
  "meeting-notes": {
    id: "meeting-notes",
    title: "Meeting notes",
    fields: [
      { id: "title", label: "Meeting title" },
      { id: "date", label: "Date / time" },
      { id: "attendees", label: "Attendees", placeholder: "Names or teams" },
      { id: "objectives", label: "Objectives", multiline: true },
    ],
    build: (v) =>
      [
        `# ${val(v, "title", "Meeting")}`,
        `**When:** ${val(v, "date", "TBD")}`,
        `**Attendees:** ${val(v, "attendees", "—")}`,
        "",
        "## Agenda / discussion",
        "- ",
        "",
        "## Decisions",
        "- ",
        "",
        "## Actions",
        "| Owner | Action | Due |",
        "| --- | --- | --- |",
        "| | | |",
        "",
        "## Objectives (context)",
        val(v, "objectives", "—"),
      ].join("\n"),
  },
  "email-subject": {
    id: "email-subject",
    title: "Email subject lines",
    fields: [
      { id: "topic", label: "Topic / ask" },
      { id: "tone", label: "Tone", placeholder: "e.g. concise, warm, urgent" },
    ],
    build: (v) => {
      const topic = val(v, "topic", "your update");
      const tone = val(v, "tone", "professional");
      return [
        `Suggested subjects (${tone}):`,
        `1. ${topic} — quick summary + next step`,
        `2. [Action needed] ${topic}`,
        `3. Following up: ${topic}`,
        `4. ${topic} (by Friday EOD)`,
      ].join("\n");
    },
  },
  "email-reply": {
    id: "email-reply",
    title: "Professional reply",
    fields: [
      { id: "context", label: "What they asked / said", multiline: true },
      { id: "response", label: "Your intent", multiline: true, placeholder: "What you want to convey" },
    ],
    build: (v) =>
      [
        "Hi [Name],",
        "",
        "Thanks for your note.",
        "",
        val(v, "context", "[Their request]"),
        "",
        val(v, "response", "[Your response]"),
        "",
        "Happy to discuss if helpful.",
        "",
        "Best regards,",
        "[Your name]",
      ].join("\n"),
  },
  ooo: {
    id: "ooo",
    title: "Out of office",
    fields: [
      { id: "dates", label: "Away dates" },
      { id: "backup", label: "Backup contact" },
      { id: "reason", label: "Optional reason", placeholder: "Annual leave, conference…" },
    ],
    build: (v) =>
      [
        "Subject: Out of office",
        "",
        "Thanks for your message.",
        "",
        `I am away ${val(v, "dates", "[dates]")}${val(v, "reason") ? ` (${val(v, "reason")})` : ""} with limited access to email.`,
        "",
        `For urgent matters, please contact ${val(v, "backup", "[backup]")}.`,
        "",
        "I'll respond when I'm back.",
        "",
        "Best,",
        "[Your name]",
      ].join("\n"),
  },
  agenda: {
    id: "agenda",
    title: "Meeting agenda",
    fields: [
      { id: "meeting", label: "Meeting name" },
      { id: "duration", label: "Duration (minutes)" },
      { id: "topics", label: "Topics (one per line)", multiline: true },
    ],
    build: (v) => {
      const lines = val(v, "topics", "- Intro\n- Updates\n- Q&A")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      let t = 0;
      const dur = parseInt(val(v, "duration", "30"), 10) || 30;
      const slot = Math.max(5, Math.floor(dur / Math.max(lines.length, 1)));
      const rows = lines.map((topic, i) => {
        const start = t;
        t += slot;
        return `| ${String(i + 1).padStart(2, "0")} | ${start}–${t} min | ${topic} | Owner |`;
      });
      return [
        `# Agenda — ${val(v, "meeting", "Meeting")}`,
        "",
        "| # | Time | Topic | Owner |",
        "| --- | --- | --- | --- |",
        ...rows,
        "",
        "_Adjust timings as needed._",
      ].join("\n");
    },
  },
  "follow-up": {
    id: "follow-up",
    title: "Follow-up email",
    fields: [
      { id: "prior", label: "Previous touchpoint", multiline: true },
      { id: "ask", label: "Your ask", multiline: true },
    ],
    build: (v) =>
      [
        "Hi [Name],",
        "",
        "Great speaking earlier — summarising next steps:",
        "",
        val(v, "prior", "[Recap]"),
        "",
        val(v, "ask", "[Clear ask]"),
        "",
        "Let me know if you need anything else from my side.",
        "",
        "Thanks,",
        "[Your name]",
      ].join("\n"),
  },
  "work-report": {
    id: "work-report",
    title: "Daily work report",
    fields: [
      { id: "wins", label: "Completed / wins", multiline: true },
      { id: "blockers", label: "Blockers / risks", multiline: true },
      { id: "tomorrow", label: "Plan for tomorrow", multiline: true },
    ],
    build: (v) =>
      [
        `# Daily report — ${new Date().toLocaleDateString()}`,
        "",
        "## Done",
        val(v, "wins", "—"),
        "",
        "## Blockers",
        val(v, "blockers", "None"),
        "",
        "## Next",
        val(v, "tomorrow", "—"),
      ].join("\n"),
  },
  "file-name": {
    id: "file-name",
    title: "File naming",
    fields: [
      { id: "project", label: "Project / client" },
      { id: "type", label: "Artifact type", placeholder: "spec, invoice, deck" },
      { id: "version", label: "Version / date token", placeholder: "v2 or 2026-05-13" },
    ],
    build: (v) => {
      const slug = (s: string) =>
        s
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      const p = slug(val(v, "project", "project"));
      const t = slug(val(v, "type", "doc"));
      const ver = slug(val(v, "version", "v1"));
      return [
        "Suggested patterns (pick one):",
        `${p}__${t}__${ver}.pdf`,
        `${new Date().toISOString().slice(0, 10)}_${p}_${t}.pdf`,
        `${p}-${t}-${ver}.pdf`,
        "",
        "Tips: avoid spaces; use ISO dates; keep under 120 chars.",
      ].join("\n");
    },
  },
  "campaign-ideas": {
    id: "campaign-ideas",
    title: "Campaign ideas",
    fields: [
      { id: "product", label: "Product / offer" },
      { id: "audience", label: "Audience" },
      { id: "constraint", label: "Constraint", placeholder: "budget, season, region" },
    ],
    build: (v) => {
      const product = val(v, "product", "the offer");
      const aud = val(v, "audience", "your audience");
      const c = val(v, "constraint", "your constraints");
      return [
        `Angles for **${product}** (${aud}, ${c}):`,
        "",
        "1. Problem → agitate → solution mini-story",
        "2. Social proof carousel (before/after metrics)",
        "3. Founder-led Loom + landing page CTA",
        "4. Partner co-marketing bundle",
        "5. Retargeting with objection handling FAQ",
        "6. Limited-time bonus stack (clear deadline)",
        "",
        "Pick 2, ship one this week.",
      ].join("\n");
    },
  },
  "social-caption": {
    id: "social-caption",
    title: "Social caption",
    fields: [
      { id: "hook", label: "Hook / news" },
      { id: "cta", label: "Call to action" },
    ],
    build: (v) =>
      [
        val(v, "hook", "Hook goes here"),
        "",
        val(v, "cta", "Learn more → link in bio"),
        "",
        "#launch #marketing",
      ].join("\n"),
  },
  "blog-titles": {
    id: "blog-titles",
    title: "Blog titles",
    fields: [{ id: "topic", label: "Topic / keyword" }],
    build: (v) => {
      const t = val(v, "topic", "your topic");
      return [
        `Title ideas for “${t}”:`,
        `1. ${t}: what we learned in production`,
        `2. A practical guide to ${t} (with checklist)`,
        `3. Why ${t} fails (and how we fixed it)`,
        `4. ${t} in 10 minutes — templates included`,
        `5. The ${t} playbook for small teams`,
      ].join("\n");
    },
  },
  "meta-seo": {
    id: "meta-seo",
    title: "Meta title & description",
    fields: [
      { id: "page", label: "Page topic" },
      { id: "primaryKw", label: "Primary keyword" },
    ],
    build: (v) => {
      const page = val(v, "page", "Page");
      const kw = val(v, "primaryKw", "keyword");
      const title = `${page} | ${kw}`.slice(0, 60);
      const desc = `Learn ${page.toLowerCase()} with clear steps, examples, and templates. Covers ${kw} for teams shipping fast.`.slice(0, 160);
      return [`Title (${title.length}/60):`, title, "", `Description (${desc.length}/160):`, desc].join("\n");
    },
  },
};

export function getGeneratorTemplate(id: string): GeneratorTemplate | undefined {
  return GENERATOR_TEMPLATES[id];
}
