"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function AccessibilityChecklistPage() {
  return (
    <ChecklistTool
      title="Accessibility Checklist"
      description="A pragmatic WCAG 2.2 AA pass covering text alternatives, contrast, keyboard, labels, headings, focus states and ARIA — the stuff that catches 80% of failures."
      skill="Accessibility (a11y), WCAG."
      why="Accessibility is both a legal requirement (Equality Act, ADA) and a usability win — most fixes are quick."
      storageKey="ss.accessibility-checklist"
      futureApi="Optional: wire to axe-core or Pa11y running in a serverless function to produce automated findings alongside this manual review."
      inputs={[
        { id: "page", label: "Page / URL", placeholder: "https://example.com/checkout" },
        { id: "reviewer", label: "Reviewer", placeholder: "@you" },
      ]}
      sections={[
        {
          title: "Text alternatives",
          items: [
            { id: "alt-1", label: "Every meaningful image has descriptive alt text" },
            { id: "alt-2", label: "Decorative images use alt=\"\" (not skipped)" },
            { id: "alt-3", label: "Icons that carry meaning have aria-label or visible text" },
          ],
        },
        {
          title: "Contrast & colour",
          items: [
            { id: "co-1", label: "Body text ≥ 4.5:1 contrast against background" },
            { id: "co-2", label: "Large text and UI components ≥ 3:1" },
            { id: "co-3", label: "Information is not conveyed by colour alone" },
            { id: "co-4", label: "Focus states meet 3:1 contrast against the unfocused state" },
          ],
        },
        {
          title: "Keyboard navigation",
          items: [
            { id: "kb-1", label: "Every interactive element is reachable with Tab" },
            { id: "kb-2", label: "Logical tab order matches visual reading order" },
            { id: "kb-3", label: "No keyboard traps (Esc closes modals, etc.)" },
            { id: "kb-4", label: "Skip-to-content link present and visible on focus" },
          ],
        },
        {
          title: "Labels & forms",
          items: [
            { id: "lb-1", label: "Every input has a programmatic label (label[for], aria-label or aria-labelledby)" },
            { id: "lb-2", label: "Required fields indicated in text, not just colour or asterisk" },
            { id: "lb-3", label: "Error messages identify the field and are linked via aria-describedby" },
            { id: "lb-4", label: "Autocomplete attributes used where applicable (email, name, address)" },
          ],
        },
        {
          title: "Headings & landmarks",
          items: [
            { id: "h-1", label: "Exactly one <h1> per page, matching page topic" },
            { id: "h-2", label: "Heading levels descend without skipping" },
            { id: "h-3", label: "Landmark roles (header, main, nav, footer) present" },
          ],
        },
        {
          title: "Focus states",
          items: [
            { id: "fc-1", label: "Visible focus indicator on every interactive element" },
            { id: "fc-2", label: "Focus is moved to dialogs / errors when they open / appear" },
            { id: "fc-3", label: "Focus returns to the trigger when a dialog closes" },
          ],
        },
        {
          title: "ARIA usage",
          items: [
            { id: "ar-1", label: "Use native HTML elements before reaching for ARIA roles" },
            { id: "ar-2", label: "ARIA states reflect real UI (aria-expanded, aria-current etc.)" },
            { id: "ar-3", label: "Live regions used for important asynchronous updates" },
          ],
        },
      ]}
    />
  );
}
