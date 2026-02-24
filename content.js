(async () => {
	const dataUrl = chrome.runtime.getURL('settings.json');
	const response = await fetch(dataUrl);
	window.deSaffSettings = await response.json();

	// Prevent duplicate runs in same tab execution
	if (!window.simplifyHelpspotState) {
		window.simplifyHelpspotState = {hidden: false};
	}

	main();

	// Flip toggle state
	window.simplifyHelpspotState.hidden = !window.simplifyHelpspotState.hidden;
})();

function main() {
	const cardsSelector = window.deSaffSettings.onlyPrivate
		? "div.note-stream-item.note-stream-item-private"
		: "div.note-stream-item"

	const cards = document.querySelectorAll(cardsSelector)

	// Show
	if (window.simplifyHelpspotState.hidden) {
		showAll();

		return;
	}

	// Hide
	if (window.deSaffSettings.hideAttachments) {
		hideAttachments();
	}

	for (const card of cards) {
		const name = card.querySelector('.note-stream-item-name');

		if (!window.deSaffSettings.hideUsers.includes(name.innerText)) {
			if (window.deSaffSettings.hideEmailChains) {
				hideEmailChain(card.querySelector('.note-stream-item-text'));
			}

			continue;
		}

		hideElement("Show update", card.querySelector('.note-stream-item-text'));
	}
}

function hideAttachments() {
	const allAttachments = document.querySelectorAll('.note-stream-item-attachments');

	for (const attachments of allAttachments) {
		hideElement("Show attachments", attachments);
	}
}

function hideElement(name, element, onClick) {
	element.dataset.originalDisplay = element.style.display;
	element.style.display = "none";

	const showButton = document.createElement('a');
	showButton.classList.add('de-saff-show');
	showButton.classList.add('btn', 'inline-action', 'btn-request-private');
	showButton.style.marginBottom = '5px';
	showButton.innerText = name;

	showButton.onclick = e => {
		e.preventDefault();
		element.style.display = element.dataset.originalDisplay;
		e.target.style.display = "none";
		showButton.remove();

		onClick?.(element);
	}

	element.parentElement.appendChild(showButton);
}

function showAll() {
	const showButtons = document.querySelectorAll('.de-saff-show');

	for (const btn of showButtons) {
		btn.click();
	}
}

function hideEmailChain(cardElement) {
	// 1. Target the specific "From:" div
	const chainHeader = cardElement.querySelector('div[style*="border-color: rgb(181, 196, 223)"]');

	// Safety check: Don't process if not found or if already wrapped
	if (!chainHeader || chainHeader.parentElement.classList.contains('de-saff-wrapper')) return;

	// 2. Create the wrapper
	const wrapper = document.createElement('div');
	wrapper.classList.add('de-saff-wrapper');

	// 3. Move the header and all subsequent siblings into the wrapper
	// We insert the wrapper right before the header first
	chainHeader.parentNode.insertBefore(wrapper, chainHeader);

	let nextNode;
	let current = chainHeader;

	while (current) {
		nextNode = current.nextSibling; // Save the next sibling before moving 'current'
		wrapper.appendChild(current);   // Moving the node removes it from its old spot
		current = nextNode;
	}

	hideElement("Show email chain", wrapper, wrapper => {
		// This callback is needed to unwrap the contents when showing
		const originalParent = wrapper.parentNode;

		// Move all children back to the parent, placed right before the wrapper itself
		while (wrapper.firstChild) {
			originalParent.insertBefore(wrapper.firstChild, wrapper);
		}

		// Now that the wrapper is empty and the children are restored, remove the wrapper
		wrapper.remove();
	});
}
