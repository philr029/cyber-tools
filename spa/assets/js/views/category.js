import { history } from "../modules/state.js";
import { toast } from "../modules/toast.js";
import { getCategoryByRoute, getToolById } from "../modules/tool-catalog.js";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseRouteQuery() {
  const hash = window.location.hash.replace(/^#/, "");
  const [, queryString = ""] = hash.split("?");
  return new URLSearchParams(queryString);
}

function toolCard(category, tool) {
  return `
    <article class="tool-portfolio-card">
      <div class="tool-portfolio-card__top">
        <p class="tool-portfolio-card__title">${escapeHtml(tool.title)}</p>
        <p class="tool-portfolio-card__desc">${escapeHtml(tool.cardDescription)}</p>
      </div>
      <div class="tool-portfolio-card__meta">
        <p><strong>Skill:</strong> ${escapeHtml(tool.skill)}</p>
        <p><strong>API later:</strong> ${escapeHtml(tool.futureApi)}</p>
      </div>
      <a class="btn btn--secondary btn--sm" href="#${category.route}?tool=${tool.id}">
        Open tool
      </a>
    </article>
  `;
}

function buildDemoOutput(category, tool, inputValue) {
  const cleanInput = inputValue.trim() || tool.placeholder;
  const outputLines = [
    "Demo result",
    `Category: ${category.navLabel}`,
    `Tool: ${tool.title}`,
    `Input target: ${cleanInput}`,
    "",
    "Demo checks completed:",
    ...tool.checks.map((check, index) => `${index + 1}. ${check}`),
    "",
    `What this tool does: ${tool.whatItDoes}`,
    `Why this is useful: ${tool.whyUseful}`,
    `Skill demonstrated: ${tool.skill}`,
    `Future API integration: ${tool.futureApi}`,
    "",
    `Generated: ${new Date().toLocaleString()}`,
  ];
  return outputLines.join("\n");
}

function buildChecklistOutput(category, tool, inputValue) {
  const context = inputValue.trim() || tool.placeholder;
  const outputLines = [
    "Checklist output",
    `Category: ${category.navLabel}`,
    `Tool: ${tool.title}`,
    `Scope/context: ${context}`,
    "",
    "Action checklist:",
    ...tool.checks.map((check) => `- [ ] ${check}`),
    "",
    `What this tool does: ${tool.whatItDoes}`,
    `Why this is useful: ${tool.whyUseful}`,
    `Skill demonstrated: ${tool.skill}`,
    `Future API integration: ${tool.futureApi}`,
    "",
    `Generated: ${new Date().toLocaleString()}`,
  ];
  return outputLines.join("\n");
}

function buildToolOutput(category, tool, inputValue) {
  return tool.mode === "checklist"
    ? buildChecklistOutput(category, tool, inputValue)
    : buildDemoOutput(category, tool, inputValue);
}

function workspaceHtml(category, tool) {
  const outputTag = tool.mode === "checklist" ? "Checklist output" : "Demo result";
  return `
    <section class="card card--panel tool-workspace" id="active-tool-workspace">
      <div class="card__body">
        <div class="tool-workspace__header">
          <div>
            <p class="tool-workspace__kicker">${escapeHtml(category.navLabel)} / Active tool</p>
            <h2 class="tool-workspace__title">${escapeHtml(tool.title)}</h2>
            <p class="tool-workspace__sub">${escapeHtml(tool.whatItDoes)}</p>
          </div>
          <a href="#${category.route}" class="btn btn--ghost btn--sm">Back to tools</a>
        </div>

        <div class="tool-workspace__grid">
          <article class="tool-workspace__facts">
            <p><strong>Why useful:</strong> ${escapeHtml(tool.whyUseful)}</p>
            <p><strong>Skill demonstrated:</strong> ${escapeHtml(tool.skill)}</p>
            <p><strong>Future API path:</strong> ${escapeHtml(tool.futureApi)}</p>
            <p class="tool-workspace__note">This tool currently returns ${outputTag.toLowerCase()} only.</p>
          </article>

          <article class="tool-workspace__runner">
            <label class="field-label" for="tool-runner-input">${escapeHtml(tool.inputLabel)}</label>
            <input
              id="tool-runner-input"
              class="field-input"
              type="text"
              placeholder="${escapeHtml(tool.placeholder)}"
              value=""
              autocomplete="off"
            />
            <div class="tool-workspace__actions">
              <button id="tool-run-btn" class="btn btn--primary btn--sm" type="button">
                ${escapeHtml(tool.actionLabel)}
              </button>
              <button id="tool-copy-btn" class="btn btn--secondary btn--sm" type="button" disabled>
                Copy result
              </button>
            </div>
            <pre id="tool-output" class="tool-output" aria-live="polite"></pre>
          </article>
        </div>
      </div>
    </section>
  `;
}

export function renderCategory(route) {
  const view = document.getElementById("view");
  if (!view) return;

  const category = getCategoryByRoute(route);
  if (!category) return;

  const params = parseRouteQuery();
  const selectedTool = getToolById(category, params.get("tool") || "");

  view.innerHTML = `
    <div class="page-container animate-fade-in">
      <section class="card card--panel category-hero">
        <div class="card__body">
          <p class="category-hero__kicker">${escapeHtml(category.shortLabel)} CATEGORY</p>
          <h1 class="page-title">${escapeHtml(category.headline)}</h1>
          <p class="page-sub">${escapeHtml(category.description)}</p>
          <div class="category-hero__actions">
            <a href="#/home" class="btn btn--secondary btn--sm">Home</a>
            <a href="#/about" class="btn btn--ghost btn--sm">About this project</a>
          </div>
        </div>
      </section>

      ${selectedTool ? workspaceHtml(category, selectedTool) : ""}

      <section class="card card--panel">
        <div class="card__body">
          <div class="section-header">
            <h2 class="section-title">${escapeHtml(category.navLabel)} cards</h2>
            <p class="section-sub">Every card opens a working tool section with no dead links.</p>
          </div>
          <div class="tool-portfolio-grid">
            ${category.tools.map((tool) => toolCard(category, tool)).join("")}
          </div>
        </div>
      </section>
    </div>
  `;

  if (!selectedTool) return;

  const runBtn = document.getElementById("tool-run-btn");
  const copyBtn = document.getElementById("tool-copy-btn");
  const input = document.getElementById("tool-runner-input");
  const output = document.getElementById("tool-output");

  if (!runBtn || !copyBtn || !input || !output) return;

  let latestOutput = "";

  runBtn.addEventListener("click", () => {
    latestOutput = buildToolOutput(category, selectedTool, input.value);
    output.textContent = latestOutput;
    copyBtn.removeAttribute("disabled");
    history.add({
      query: `${selectedTool.title}:${input.value.trim() || selectedTool.placeholder}`,
      type: category.id,
      status: selectedTool.mode === "checklist" ? "safe" : "warning",
    });
    toast.success(`${selectedTool.title} ${selectedTool.mode === "checklist" ? "checklist" : "demo"} generated.`);
  });

  copyBtn.addEventListener("click", async () => {
    if (!latestOutput) {
      toast.warning("Run the tool first to generate output.");
      return;
    }

    try {
      await navigator.clipboard.writeText(latestOutput);
      toast.success("Result copied to clipboard.");
    } catch {
      toast.error("Clipboard copy failed in this browser context.");
    }
  });
}
