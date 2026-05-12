import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isMarketingLiveSlug } from "@/lib/marketing-tools/catalog";
import BlogTitleGeneratorTool from "@/app/components/marketing/live/BlogTitleGeneratorTool";
import ConversionRateCalculatorTool from "@/app/components/marketing/live/ConversionRateCalculatorTool";
import LinkedInPostGeneratorTool from "@/app/components/marketing/live/LinkedInPostGeneratorTool";
import RoasCalculatorTool from "@/app/components/marketing/live/RoasCalculatorTool";
import SubjectLineGeneratorTool from "@/app/components/marketing/live/SubjectLineGeneratorTool";
import UtmBuilderTool from "@/app/components/marketing/live/UtmBuilderTool";

const TITLES: Record<string, string> = {
  "utm-builder": "UTM Builder",
  "blog-title-generator": "Blog Title Generator",
  "subject-line-generator": "Subject Line Generator",
  "roas-calculator": "ROAS Calculator",
  "conversion-rate-calculator": "Conversion Rate Calculator",
  "linkedin-post-generator": "LinkedIn Post Generator",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isMarketingLiveSlug(slug)) return { title: "Not found — SecureScope" };
  const title = TITLES[slug] ?? "Marketing tool";
  return {
    title: `${title} — Marketing Tools`,
    description: `Use the SecureScope ${title} — runs locally in your browser.`,
  };
}

export default async function MarketingLiveToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isMarketingLiveSlug(slug)) notFound();

  switch (slug) {
    case "utm-builder":
      return <UtmBuilderTool />;
    case "blog-title-generator":
      return <BlogTitleGeneratorTool />;
    case "subject-line-generator":
      return <SubjectLineGeneratorTool />;
    case "roas-calculator":
      return <RoasCalculatorTool />;
    case "conversion-rate-calculator":
      return <ConversionRateCalculatorTool />;
    case "linkedin-post-generator":
      return <LinkedInPostGeneratorTool />;
    default:
      notFound();
  }
}
