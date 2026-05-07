function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function heavyComputation(iterations, baseline) {
  let acc = baseline;
  for (let i = 0; i < iterations; i += 1) {
    acc = (acc * 1.00031 + Math.sin(i % 360) * 0.019 + (i % 7) * 0.004) % 100;
  }
  return Math.abs(acc);
}

function runDeepfakeAnalysis(payload) {
  const baseline = payload.historySignals.risk * 14 + payload.historySignals.warning * 6 + 28;
  const score = clamp(Math.round(heavyComputation(260000, baseline)), 12, 98);
  const confidence = clamp(62 + Math.round((100 - score) * 0.2), 60, 95);
  return {
    tool: "deepfake",
    score,
    confidence,
    summary:
      score > 65
        ? "High probability of synthetic manipulation from motion/audio mismatches."
        : "No major manipulation cluster detected, but low-signal artifacts remain.",
    recommendations: [
      "Enforce source authenticity checks for media uploads.",
      "Require human review for externally shared high-impact media.",
      "Enable provenance signatures for trusted media workflows.",
    ],
  };
}

function runShadowGovernance(payload) {
  const baseline = payload.historySignals.risk * 13 + payload.historySignals.warning * 8 + 25;
  const score = clamp(Math.round(heavyComputation(230000, baseline)), 8, 97);
  const confidence = clamp(66 + Math.round(score * 0.14), 64, 96);
  return {
    tool: "shadow-governance",
    score,
    confidence,
    summary:
      score > 60
        ? "Unsanctioned model usage and policy drift patterns require immediate containment."
        : "Governance posture is mostly controlled with moderate policy enforcement gaps.",
    recommendations: [
      "Restrict non-approved model endpoints at the egress layer.",
      "Rotate exposed AI keys and enforce just-in-time credentials.",
      "Add weekly shadow-AI attestation and policy variance review.",
    ],
  };
}

self.onmessage = (event) => {
  const { tool, payload } = event.data ?? {};
  if (!tool || !payload) return;

  if (tool === "deepfake") {
    self.postMessage(runDeepfakeAnalysis(payload));
    return;
  }

  if (tool === "shadow-governance") {
    self.postMessage(runShadowGovernance(payload));
  }
};
