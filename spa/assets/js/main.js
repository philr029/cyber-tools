import { initState } from "./modules/state.js";
import { initTheme } from "./modules/theme.js";
import { initSidebar } from "./modules/sidebar.js";
import { router } from "./modules/router.js";
import { toast } from "./modules/toast.js";
import { renderHome } from "./views/home.js";
import { renderCategory } from "./views/category.js";
import { renderAbout } from "./views/about.js";

function registerRoutes() {
  router.register("/home", renderHome);
  router.register("/web-tools", () => renderCategory("/web-tools"));
  router.register("/cyber-tools", () => renderCategory("/cyber-tools"));
  router.register("/microsoft-365-tools", () => renderCategory("/microsoft-365-tools"));
  router.register("/domain-ip-tools", () => renderCategory("/domain-ip-tools"));
  router.register("/automation-tools", () => renderCategory("/automation-tools"));
  router.register("/phone-lead-testing-tools", () => renderCategory("/phone-lead-testing-tools"));
  router.register("/about", renderAbout);

  // Legacy compatibility routes.
  router.register("/dashboard", renderHome);
  router.register("/tools", () => renderCategory("/web-tools"));
  router.register("/ai", () => renderCategory("/automation-tools"));
  router.register("/reports", () => renderCategory("/cyber-tools"));
  router.register("/pricing", () => renderCategory("/microsoft-365-tools"));
  router.register("/account", renderAbout);
  router.register("/settings", renderAbout);
}

function wireGlobalButtons() {
  document.getElementById("theme-btn")?.addEventListener("click", () => {
    toast.info("Theme updated.");
  });
}

(function boot() {
  initState();
  initTheme();
  initSidebar();
  registerRoutes();
  wireGlobalButtons();
  router.init();
})();
