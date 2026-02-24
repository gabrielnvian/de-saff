// Prevent duplicate runs in same tab execution
if (!window.simplifyHelpspotState) {
  window.simplifyHelpspotState = { hidden: false };
}

const cards = document.querySelectorAll(
    "div.note-stream-item.card.smshadow.note-stream-item-private, div.note-stream-item.card.smshadow.note-stream-item-odd.note-stream-item-private"
);

cards.forEach(card => {
  const header = card.querySelector(".note-stream-item-header");

  const shouldAffect =
      card.textContent.includes("Request Changed:") ||
      (header && header.textContent.includes("Mark Saffell"));

  if (shouldAffect) {
    if (!window.simplifyHelpspotState.hidden) {
      // Hide
      card.dataset.originalDisplay = card.style.display;
      card.style.display = "none";
    } else {
      // Show
      card.style.display = card.dataset.originalDisplay || "";
    }
  }
});

// Flip toggle state
window.simplifyHelpspotState.hidden = !window.simplifyHelpspotState.hidden;

console.log("Simplify Helpspot toggle state:", window.simplifyHelpspotState.hidden);
