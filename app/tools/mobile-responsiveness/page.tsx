"use client";

import ChecklistTool from "@/app/components/tools/ChecklistTool";

export default function MobileResponsivenessPage() {
  return (
    <ChecklistTool
      title="Mobile Responsiveness Checklist"
      description="QA checklist for verifying a site works on small screens — viewport, tap targets, breakpoints, typography, and forms."
      skill="Responsive web design, mobile UX"
      why="Most users arrive on mobile, but 'responsive' is often only verified at three sizes. This checklist catches the awkward in-between ones too."
      inputs={[
        { id: "page", label: "Page being audited", placeholder: "https://example.com/" },
      ]}
      sections={[
        {
          title: "Foundation",
          items: [
            { id: "mr-f1", label: "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> is present" },
            { id: "mr-f2", label: "Layout has no horizontal scroll at 320px width" },
            { id: "mr-f3", label: "Fixed-pixel widths replaced with %, rem, or flexible CSS Grid/Flex" },
            { id: "mr-f4", label: "Site responds at 360, 414, 768, 1024, 1280, 1536 widths" },
          ],
        },
        {
          title: "Interaction",
          items: [
            { id: "mr-i1", label: "All tap targets ≥ 44×44 px (Apple HIG) / 48×48 dp (Material)" },
            { id: "mr-i2", label: "Hover-only interactions have a touch equivalent" },
            { id: "mr-i3", label: "Mobile navigation (hamburger or bottom bar) is reachable with one hand" },
            { id: "mr-i4", label: "Sticky header / bottom bar does not obscure form inputs when the keyboard opens" },
          ],
        },
        {
          title: "Forms & input",
          items: [
            { id: "mr-fm1", label: "Inputs use correct inputmode / type (email, tel, numeric)" },
            { id: "mr-fm2", label: "Date / time pickers use native controls where appropriate" },
            { id: "mr-fm3", label: "Form fields don't zoom Safari (font-size ≥ 16px)" },
            { id: "mr-fm4", label: "Submit button is full width or thumb-reachable on small screens" },
          ],
        },
        {
          title: "Typography & media",
          items: [
            { id: "mr-t1", label: "Body text ≥ 16px / 1rem with comfortable line height" },
            { id: "mr-t2", label: "Headings scale down on small screens (clamp() or breakpoint rules)" },
            { id: "mr-t3", label: "Images don't overflow their containers (max-width: 100%, height: auto)" },
            { id: "mr-t4", label: "Videos use a responsive container (aspect-ratio CSS)" },
          ],
        },
        {
          title: "Testing matrix",
          items: [
            { id: "mr-x1", label: "Tested on iOS Safari (latest + previous major)" },
            { id: "mr-x2", label: "Tested on Android Chrome (latest)" },
            { id: "mr-x3", label: "Tested with Reduce Motion and Bold Text enabled" },
            { id: "mr-x4", label: "Tested on a real low-end Android (throttled 4G + slow CPU)" },
          ],
        },
      ]}
    />
  );
}
