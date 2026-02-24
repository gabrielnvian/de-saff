(async () => {
	const data = await chrome.storage.local.get('deSaffSettings');

	if (data.deSaffSettings) {
		window.deSaffSettings = data.deSaffSettings;
	} else {
		// Fallback: If storage is empty, fetch the bundled file as a safety net
		const response = await fetch(chrome.runtime.getURL('settings.json'));
		window.deSaffSettings = await response.json();
	}

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
		: "div.note-stream-item";

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

	for (let i = 0; i < cards.length; i++) {
		const card = cards[i];
		const name = getCardName(card);

		if (window.deSaffSettings.hideStatusUpdates) {
			if (hideIfStatusUpdate(card)) {
				// If this is a status update, we are done
				continue;
			}
		}

		// If it's a "Normal" user, just handle email chains and move on
		if (!window.deSaffSettings.hideUsers.includes(name)) {
			if (window.deSaffSettings.hideEmailChains) {
				hideEmailChain(card.querySelector('.note-stream-item-text'));
			}

			continue;
		}

		// If it's a "Hide" user, look for consecutive cards from the hide list
		let group = [card];
		let namesInGroup = new Set([name]);

		while (i + 1 < cards.length) {
			const nextCard = cards[i + 1];
			const nextName = getCardName(nextCard);

			if (window.deSaffSettings.hideUsers.includes(nextName)) {
				group.push(nextCard);
				namesInGroup.add(nextName);
				i++; // Increment outer loop to skip these processed cards
			} else {
				break;
			}
		}

		// Wrap and hide the group
		handleCardGrouping(group, Array.from(namesInGroup));
	}
}

function getCardName(card) {
	return card.querySelector('.note-stream-item-name').innerText.trim();
}

function hideIfStatusUpdate(card) {
	const internalUpdate = card.querySelector('.note-stream-item-logtext');

	if (internalUpdate) {
		internalUpdate
			.parentElement
			.parentElement
			.parentElement
			.parentElement
			.remove();

		return true;
	}

	return false;
}

function hideAttachments() {
	const allAttachments = document.querySelectorAll('.note-stream-item-attachments');

	for (const attachments of allAttachments) {
		hideElement("Show attachments", attachments);
	}
}

function handleCardGrouping(cards, names) {
	if (cards.length === 0) return;

	// Create a wrapper for the group
	const groupWrapper = document.createElement('div');
	groupWrapper.classList.add('de-saff-group-wrapper');

	// Insert wrapper before the first card
	const firstCard = cards[0];
	firstCard.parentNode.insertBefore(groupWrapper, firstCard);

	// Move all cards in the group into the wrapper
	for (const card of cards) {
		groupWrapper.appendChild(card);
	}

	const label = cards.length > 1
		? `Show ${cards.length} updates from ${names.join(' & ')}`
		: `Show update from ${names[0]}`;

	// Hide the whole wrapper
	hideElement(label, groupWrapper, (wrapper) => {
		// Unwrap logic: put cards back where the wrapper was
		const parent = wrapper.parentNode;
		while (wrapper.firstChild) {
			parent.insertBefore(wrapper.firstChild, wrapper);
		}
		wrapper.remove();
	});
}

function hideElement(name, element, onClick) {
	element.dataset.originalDisplay = element.style.display;
	element.style.display = "none";

	const showButton = document.createElement('a');
	showButton.classList.add('de-saff-show');
	showButton.classList.add('btn', 'inline-action', 'btn-request-private');
	showButton.style.marginLeft = '5px';
	showButton.style.marginBottom = '5px';
	showButton.innerText = name;

	showButton.onclick = e => {
		e.preventDefault();
		element.style.display = element.dataset.originalDisplay;
		e.target.style.display = "none";
		showButton.remove();

		onClick?.(element);
	}

	// Instead of appendChild, we place it exactly where the hidden element starts
	element.insertAdjacentElement('beforebegin', showButton);
}

function showAll() {
	const showButtons = document.querySelectorAll('.de-saff-show');

	for (const btn of showButtons) {
		btn.click();
	}
}

function hideEmailChain(cardElement) {
	// 1. Find all bold tags that contain "From:"
	const bTags = cardElement.querySelectorAll('b');
	let chainHeader = null;

	for (const b of bTags) {
		if (b.innerText.trim().startsWith("From:")) {
			// 2. The header is usually the parent div of this 'b' tag
			// We look for the closest div that has a border or specific padding
			chainHeader = b.closest('div[style*="border"]');
			if (chainHeader) break;
		}
	}

	// Safety check: Don't re-wrap if it's already in our wrapper
	if (!chainHeader || chainHeader.closest('.de-saff-wrapper')) return;

	// 3. The Wrapper Logic (Same as before)
	const wrapper = document.createElement('div');
	wrapper.classList.add('de-saff-wrapper');
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

document.addEventListener('click', (event) => {
	// 1. Check if the clicked element is the "Show All" button
	// We check for the class 'btn accent' and the text 'Show All'
	if (event.target.matches('a.btn.accent') && event.target.innerText === "Show All") {

		console.log("De-Saff: 'Show All' clicked. Waiting for history to load...");

		// 2. We need to wait for HelpSpot's AJAX to finish.
		// Since we don't know exactly how long it takes, we poll for the removal
		// of the loading message or a slight delay.
		const checkLoad = setInterval(() => {
			const loadingMsg = document.querySelector('#note-stream-load-more');

			// If the loading message is gone or changed back from 'ajaxLoading',
			// HelpSpot is likely done.
			if (loadingMsg && !loadingMsg.innerHTML.includes('gif')) {
				clearInterval(checkLoad);

				// Extra 300ms cushion for HelpSpot's evalScripts() to finish
				setTimeout(() => {
					console.log("De-Saff: History loaded. Re-running main...");

					main();
					window.simplifyHelpspotState.hidden = !window.simplifyHelpspotState.hidden;

					setTimeout(() => {
						main();
						window.simplifyHelpspotState.hidden = !window.simplifyHelpspotState.hidden;
					}, 500)
				}, 300);
			}
		}, 500);

		// Safety timeout: stop looking after 10 seconds if it fails
		setTimeout(() => clearInterval(checkLoad), 10000);
	}
}, true); // Use 'true' for the capture phase to catch it early
