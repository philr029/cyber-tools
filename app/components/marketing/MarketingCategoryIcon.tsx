"use client";

import {
  ChartLine,
  EnvelopeSimple,
  GlobeHemisphereWest,
  Lightning,
  MagnifyingGlass,
  MapPin,
  MegaphoneSimple,
  PaintBrush,
  ShareNetwork,
  Sparkle,
  TextAa,
} from "@phosphor-icons/react";
import type { MarketingCategoryId } from "@/lib/marketing-tools/types";

const iconCls = "h-6 w-6";

export function MarketingCategoryIcon({ id }: { id: MarketingCategoryId }) {
  const common = `${iconCls} shrink-0`;
  switch (id) {
    case "seo":
      return <MagnifyingGlass className={`${common} text-sky-300`} aria-hidden weight="duotone" />;
    case "content":
      return <TextAa className={`${common} text-violet-300`} aria-hidden weight="duotone" />;
    case "social":
      return <ShareNetwork className={`${common} text-pink-300`} aria-hidden weight="duotone" />;
    case "email":
      return <EnvelopeSimple className={`${common} text-amber-300`} aria-hidden weight="duotone" />;
    case "paid":
      return <MegaphoneSimple className={`${common} text-orange-300`} aria-hidden weight="duotone" />;
    case "branding":
      return <PaintBrush className={`${common} text-fuchsia-300`} aria-hidden weight="duotone" />;
    case "website":
      return <GlobeHemisphereWest className={`${common} text-emerald-300`} aria-hidden weight="duotone" />;
    case "analytics":
      return <ChartLine className={`${common} text-cyan-300`} aria-hidden weight="duotone" />;
    case "local":
      return <MapPin className={`${common} text-teal-300`} aria-hidden weight="duotone" />;
    case "ai":
      return <Sparkle className={`${common} text-indigo-300`} aria-hidden weight="duotone" />;
    default:
      return <Lightning className={`${common} text-slate-300`} aria-hidden weight="duotone" />;
  }
}
