let isOpen = false;

function setOpenState(open) {
  const menu = document.getElementById("mobile-menu");
  const overlay = document.getElementById("mobile-menu-overlay");
  const button = document.getElementById("menu-btn");

  isOpen = open;
  menu?.classList.toggle("sidebar--open", open);
  overlay?.classList.toggle("sidebar-overlay--visible", open);
  button?.setAttribute("aria-expanded", open ? "true" : "false");
  document.body.style.overflow = open ? "hidden" : "";
}

export function openSidebar() {
  setOpenState(true);
}

export function closeSidebar() {
  setOpenState(false);
}

export function initSidebar() {
  const menuBtn = document.getElementById("menu-btn");
  const closeBtn = document.getElementById("mobile-menu-close-btn");
  const overlay = document.getElementById("mobile-menu-overlay");
  const menu = document.getElementById("mobile-menu");

  menuBtn?.addEventListener("click", () => openSidebar());
  closeBtn?.addEventListener("click", () => closeSidebar());
  overlay?.addEventListener("click", () => closeSidebar());

  menu?.querySelectorAll("[data-route]").forEach((link) => {
    link.addEventListener("click", () => closeSidebar());
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) {
      closeSidebar();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024 && isOpen) {
      closeSidebar();
    }
  });

  window.addEventListener("hashchange", () => {
    if (isOpen) closeSidebar();
  });
}
