import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolkitPlaceholder from "@/app/components/tools/ToolkitPlaceholder";
import {
  PREVIEW_MODULES,
  PREVIEW_SLUGS,
  isPreviewSlug,
  type PreviewSlug,
} from "@/lib/tools/preview-placeholders";

export function generateStaticParams(): { slug: PreviewSlug }[] {
  return PREVIEW_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isPreviewSlug(slug)) return { title: "Toolkit preview" };
  const m = PREVIEW_MODULES[slug];
  return {
    title: `${m.title} — SecureScope`,
    description: m.description,
  };
}

export default async function ToolkitPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isPreviewSlug(slug)) notFound();
  const m = PREVIEW_MODULES[slug];
  const statusLabel = m.status === "planned" ? "Planned module" : "Demo module";

  return (
    <ToolkitPlaceholder
      title={m.title}
      description={m.description}
      category={`${m.categoryChip} · ${statusLabel}`}
      bullets={m.bullets}
      primaryAction={m.primaryAction}
      related={m.related}
    />
  );
}
