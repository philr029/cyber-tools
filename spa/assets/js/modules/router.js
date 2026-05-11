const routes = new Map();
let currentPath = "/home";

const LABELS = {
  "/home": "Home",
  "/web-tools": "Web Tools",
  "/cyber-tools": "Cyber Tools",
  "/microsoft-365-tools": "Microsoft 365 Tools",
  "/domain-ip-tools": "Domain/IP Tools",
  "/automation-tools": "Automation Tools",
  "/phone-lead-testing-tools": "Phone/Lead Testing Tools",
  "/about": "About",
};

function normalizePath(path) {
  const value = String(path ?? "").trim();
  if (!value) return "/home";
  const withSlash = value.startsWith("/") ? value : `/${value}`;
  return withSlash.toLowerCase();
}

function parsePathFromHash() {
  const hash = window.location.hash.replace(/^#/, "");
  const [pathOnly] = hash.split("?");
  return normalizePath(pathOnly || "/home");
}

function updateActiveNav(path) {
  document.querySelectorAll("[data-route]").forEach((link) => {
    const active = link.getAttribute("data-route") === path;
    link.classList.toggle("sidebar__nav-link--active", active);
    link.classList.toggle("topbar__nav-link--active", active);
    link.setAttribute("aria-current", active ? "page" : "false");
  });
}

function updateDocumentTitle(path) {
  const label = LABELS[path] ?? "Home";
  document.title = `SecureScope Toolkit - ${label}`;
}

function resolveRoute() {
  const requestedPath = parsePathFromHash();
  const handler = routes.get(requestedPath) ?? routes.get("/home");
  if (typeof handler !== "function") return;

  const resolvedPath = routes.has(requestedPath) ? requestedPath : "/home";
  if (!routes.has(requestedPath) && requestedPath !== "/home") {
    window.location.hash = "/home";
  }

  currentPath = resolvedPath;
  handler();
  updateActiveNav(resolvedPath);
  updateDocumentTitle(resolvedPath);
}

export const router = {
  register(path, handler) {
    routes.set(normalizePath(path), handler);
  },

  navigate(path) {
    window.location.hash = normalizePath(path);
  },

  current() {
    return currentPath;
  },

  init() {
    window.addEventListener("hashchange", resolveRoute);
    resolveRoute();
  },
};
