/**
 * modal.js
 * Composant modale de confirmation, accessible et réutilisable.
 * Aucune dépendance externe. Exporté en tant que module ES.
 *
 * Utilisation :
 *   import { openConfirmModal } from "./modal.js";
 *   openConfirmModal({
 *     title: "Appeler l'association ?",
 *     message: "Vous allez lancer un appel vers ...",
 *     confirmLabel: "Appeler",
 *     onConfirm: () => { window.location.href = "tel:..."; }
 *   });
 */

let overlayEl = null;
let lastFocusedEl = null;

function getOverlay() {
  if (overlayEl) return overlayEl;

  overlayEl = document.createElement("div");
  overlayEl.className = "modal-overlay";
  overlayEl.setAttribute("hidden", "");
  overlayEl.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-desc">
      <h2 class="modal__title" id="modal-title"></h2>
      <p class="modal__text" id="modal-desc"></p>
      <p class="modal__note" data-modal-note hidden></p>
      <div class="modal__actions">
        <button type="button" class="btn btn--primary" data-modal-confirm></button>
        <button type="button" class="btn btn--ghost" data-modal-cancel>Annuler</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlayEl);

  overlayEl.addEventListener("click", (event) => {
    if (event.target === overlayEl) closeModal();
  });

  overlayEl.querySelector("[data-modal-cancel]").addEventListener("click", closeModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !overlayEl.hasAttribute("hidden")) {
      closeModal();
    }
    // Piège à focus simple : on garde le focus dans la modale
    if (event.key === "Tab" && !overlayEl.hasAttribute("hidden")) {
      trapFocus(event);
    }
  });

  return overlayEl;
}

function trapFocus(event) {
  const focusable = overlayEl.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * Ouvre la modale de confirmation.
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.message
 * @param {string} [options.note]
 * @param {string} [options.confirmLabel]
 * @param {Function} options.onConfirm
 */
export function openConfirmModal({ title, message, note, confirmLabel = "Confirmer", onConfirm }) {
  const overlay = getOverlay();
  lastFocusedEl = document.activeElement;

  overlay.querySelector("#modal-title").textContent = title;
  overlay.querySelector("#modal-desc").textContent = message;

  const noteEl = overlay.querySelector("[data-modal-note]");
  if (note) {
    noteEl.textContent = note;
    noteEl.hidden = false;
  } else {
    noteEl.hidden = true;
  }

  const confirmBtn = overlay.querySelector("[data-modal-confirm]");
  confirmBtn.textContent = confirmLabel;

  // Remplace le gestionnaire précédent pour éviter les doublons
  const freshConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.replaceWith(freshConfirmBtn);
  freshConfirmBtn.addEventListener("click", () => {
    closeModal();
    if (typeof onConfirm === "function") onConfirm();
  });

  overlay.removeAttribute("hidden");
  freshConfirmBtn.focus();
}

export function closeModal() {
  if (!overlayEl || overlayEl.hasAttribute("hidden")) return;
  overlayEl.setAttribute("hidden", "");
  if (lastFocusedEl) lastFocusedEl.focus();
}
