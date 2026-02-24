(async () => {
	const dataUrl = chrome.runtime.getURL('settings.json');
	const response = await fetch(dataUrl);
	window.deSaffSettings = await response.json();

	// Prevent duplicate runs in same tab execution
	if (!window.simplifyHelpspotState) {
		window.simplifyHelpspotState = {hidden: false};
	}

	main();
})();

function main() {
	const cardsSelector = window.deSaffSettings.onlyPrivate
		? "div.note-stream-item.note-stream-item-private"
		: "div.note-stream-item"

	const cards = document.querySelectorAll(cardsSelector)

	if (window.simplifyHelpspotState.hidden) {
		showAll();

		window.simplifyHelpspotState.hidden = !window.simplifyHelpspotState.hidden;
		return;
	}

	if (window.deSaffSettings.hideAttachments) {
		hideAttachments();
	}

	for (const card of cards) {
		const name = card.querySelector('.note-stream-item-name');

		if (!window.deSaffSettings.hideUsers.includes(name.innerText)) continue;

		hideElement("Show update", card.querySelector('.note-stream-item-text'));
	}

	// Flip toggle state
	window.simplifyHelpspotState.hidden = !window.simplifyHelpspotState.hidden;
}

function hideAttachments() {
	const allAttachments = document.querySelectorAll('.note-stream-item-attachments');

	for (const attachments of allAttachments) {
		hideElement("Show attachments", attachments);
	}
}

function hideElement(name, element) {
	element.dataset.originalDisplay = element.style.display;
	element.style.display = "none";

	const showButton = document.createElement('a');
	showButton.classList.add('de-saff-show');
	showButton.innerText = name;

	showButton.onclick = e => {
		e.preventDefault();
		element.style.display = element.dataset.originalDisplay;
		e.target.style.display = "none";
		showButton.remove();
	}

	element.parentElement.appendChild(showButton);
}

function showAll() {
	const showButtons = document.querySelectorAll('.de-saff-show');

	for (const btn of showButtons) {
		btn.click();
	}
}
