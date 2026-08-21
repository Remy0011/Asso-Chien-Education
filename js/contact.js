/**
 * contact.js
 * Page Contact : impose une confirmation avant de déclencher un appel
 * téléphonique ou l'ouverture du client mail, et propose une copie
 * rapide dans le presse-papiers.
 *
 * Les boutons ne portent volontairement PAS de href="tel:"/"mailto:"
 * directement cliquable : l'action réelle n'est déclenchée qu'après
 * confirmation dans la modale (interaction obligatoire demandée).
 */

import { openConfirmModal } from "./modal.js";

function initPhoneAction() {
  const btn = document.querySelector("[data-contact-phone]");
  if (!btn) return;

  const rawNumber = btn.dataset.contactPhone; // ex: +33612345678
  const displayNumber = btn.querySelector(".contact-action__value")?.textContent.trim();

  btn.addEventListener("click", () => {
    openConfirmModal({
      title: "Appeler l'association ?",
      message: `Vous allez lancer un appel téléphonique vers le ${displayNumber}.`,
      note: "Sur ordinateur, cela peut ouvrir votre application d'appel par défaut.",
      confirmLabel: "Appeler maintenant",
      onConfirm: () => {
        window.location.href = `tel:${rawNumber}`;
      },
    });
  });
}

function initEmailAction() {
  const btn = document.querySelector("[data-contact-email]");
  if (!btn) return;

  const address = btn.dataset.contactEmail;

  btn.addEventListener("click", () => {
    openConfirmModal({
      title: "Envoyer un e-mail ?",
      message: `Vous allez ouvrir votre messagerie pour écrire à ${address}.`,
      note: "Aucune donnée n'est envoyée avant que vous n'écriviez et n'envoyiez votre message.",
      confirmLabel: "Ouvrir ma messagerie",
      onConfirm: () => {
        window.location.href = `mailto:${address}`;
      },
    });
  });
}

/** Copie une valeur dans le presse-papiers avec repli si l'API est indisponible. */
function initCopyButtons() {
  document.querySelectorAll("[data-copy-value]").forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      event.stopPropagation();
      const value = btn.dataset.copyValue;
      const original = btn.textContent;
      try {
        await navigator.clipboard.writeText(value);
        btn.textContent = "Copié !";
      } catch (error) {
        btn.textContent = "Copie indisponible";
      }
      setTimeout(() => {
        btn.textContent = original;
      }, 1800);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initPhoneAction();
  initEmailAction();
  initCopyButtons();
});
