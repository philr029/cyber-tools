// ---------------------------------------------------------------------------
// Risk Scoring Engine — shared types
// Reusable across all tool result types.
// ---------------------------------------------------------------------------

/** Five-level severity scale, ordered from lowest to highest. */
export type RiskSeverity = "safe" | "low" | "medium" | "high" | "critical";

/** How urgent a recommended action is. */
export type RecommendationPriority = "immediate" | "soon" | "optional";

export interface RiskRecommendation {
  priority: RecommendationPriority;
  text: string;
}

/** The full output of the risk scoring engine for a single tool result. */
export interface RiskScore {
  /** Numeric risk score 0–100 (0 = cleanest, 100 = most dangerous). */
  score: number;
  /** Five-level severity classification. */
  severity: RiskSeverity;
  /** Human-readable label matching the severity level. */
  label: "Safe" | "Low" | "Medium" | "High" | "Critical";
  /** Plain-language explanation of what drove the score. */
  explanation: string;
  /** Actionable recommendations, ordered from highest to lowest priority. */
  recommendations: RiskRecommendation[];
  /** How confident the engine is in this score (0–100). */
  confidence: number;
  /** Human-readable confidence label. */
  confidenceLabel: "Low" | "Medium" | "High";
}
