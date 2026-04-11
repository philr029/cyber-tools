// ---------------------------------------------------------------------------
// Risk Scoring Engine — public API
// ---------------------------------------------------------------------------

export type { RiskScore, RiskSeverity, RiskRecommendation, RecommendationPriority } from "./types";

export {
  scoreIPReputation,
  scoreDomainReputation,
  scoreBlacklist,
  scoreSSL,
  scoreSecurityHeaders,
  scoreDNS,
  scoreWHOIS,
  scoreEmailHeaders,
  scoreOpenPorts,
  scoreRedirectTrace,
  scoreURLAnalysis,
  scorePhone,
} from "./scorer";
