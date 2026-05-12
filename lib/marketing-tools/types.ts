export type MarketingToolStatus = "live" | "beta" | "coming-soon";

export type MarketingCategoryId =
  | "seo"
  | "content"
  | "social"
  | "email"
  | "paid"
  | "branding"
  | "website"
  | "analytics"
  | "local"
  | "ai";

export interface MarketingCategory {
  id: MarketingCategoryId;
  label: string;
  shortLabel: string;
  description: string;
}

export interface MarketingToolDef {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: MarketingCategoryId;
  status: MarketingToolStatus;
  href: string;
  featured?: boolean;
}
