/**
 * main.js
 * Comportements globaux communs à toutes les pages :
 * - bascule du menu de navigation mobile
 * - marquage du lien de nav actif (aria-current)
 */

function initNavToggle() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function markActiveLink() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav__link").forEach((link) => {
    const linkPath = link.getAttribute("href");
    if (linkPath === currentPath) {
      link.setAttribute("aria-current", "page");
    }
  });
}

/** Met à jour l'année dans le pied de page, sans script inline (compatible CSP strict). */
function setFooterYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  markActiveLink();
  setFooterYear();
});
