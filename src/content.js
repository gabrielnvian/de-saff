(async () => {
	await importSettings();

	// Prevent duplicate runs in same tab execution
	if (!window.simplifyHelpspotState) {
		window.simplifyHelpspotState = {hidden: false, manualTrigger: false};
	}

	initKeyboardNavigation();

	const state = window.simplifyHelpspotState;
	const isManualClick = state.manualTrigger === true;

	if (!isManualClick && !window.deSaffSettings.runOnLoad) return;

	// We use a helper function to wait for HelpSpot to actually render the notes
	await waitForCards();

	// Stage 1: Inject the permanent "Hide" buttons into the DOM
	injectToggles();

	// Stage 2: Determine the new global state
	if (isManualClick) {
		state.hidden = !state.hidden;
		state.manualTrigger = false;
	} else if (window.deSaffSettings.runOnLoad && !state.hidden) {
		// First automatic run: we want to hide things
		state.hidden = true;
	}

	// Stage 3: Programmatically "click" the buttons to match global state
	applyGlobalState();
})();

function injectToggles() {
	const cardsSelector = window.deSaffSettings.onlyPrivate
		? "div.note-stream-item.note-stream-item-private:not(.de-saff-processed-card)"
		: "div.note-stream-item:not(.de-saff-processed-card)";

	const cards = document.querySelectorAll(cardsSelector);

	// 1. Attachments (Inline)
	if (window.deSaffSettings.hideAttachments) {
		const allAttachments = document.querySelectorAll('.note-stream-item-attachments:not(.de-saff-processed)');

		for (const attachments of allAttachments) {
			createPermanentToggle(attachments, "attachments", "inline");
		}
	}

	// --- PASS 1: ELIMINATE STATUS UPDATES ---
	if (window.deSaffSettings.hideStatusUpdates) {
		for (let i = 0; i < cards.length; i++) {
			const card = cards[i];
			if (card.classList.contains('de-saff-processed-card')) continue;

			const internalUpdate = card.querySelector('.note-stream-item-logtext');
			if (internalUpdate) {
				card.style.display = 'none';
				card.classList.add('de-saff-processed-card');
			}
		}
	}

	// --- PASS 2: USERS & EMAIL CHAINS ---
	for (let i = 0; i < cards.length; i++) {
		const card = cards[i];

		// Skip cards already processed (this includes the status updates we just hid!)
		if (card.classList.contains('de-saff-processed-card')) continue;

		const name = getCardName(card);

		// A. Hidden Users (Grouping Logic)
		if (window.deSaffSettings.hideUsers.includes(name)) {
			let group = [card];
			let namesInGroup = new Set([name]);

			// We use lookAhead so we don't mess up our main 'i' counter too early
			let lookAhead = i + 1;

			while (lookAhead < cards.length) {
				const nextCard = cards[lookAhead];

				// If it's a "ghost" card (like a hidden status update), hop right over it!
				if (nextCard.classList.contains('de-saff-processed-card')) {
					lookAhead++;
					continue;
				}

				const nextName = getCardName(nextCard);

				if (window.deSaffSettings.hideUsers.includes(nextName)) {
					group.push(nextCard);
					namesInGroup.add(nextName);
					lookAhead++; // Move forward and keep searching
				} else {
					break; // We hit a real update from a different user. Chain broken.
				}
			}

			wrapAndToggleGroup(group, Array.from(namesInGroup));

			// Fast-forward our main loop to skip the cards we just successfully grouped
			i = lookAhead - 1;
			continue;
		}

		// B. Email Chains (For normal users)
		if (window.deSaffSettings.hideEmailChains) {
			wrapAndToggleEmailChain(card);
			card.classList.add('de-saff-processed-card');
		}
	}
}

function applyGlobalState() {
	fixDarkMode();

	const state = window.simplifyHelpspotState;
	const allToggles = document.querySelectorAll('.de-saff-toggle');

	for (const btn of allToggles) {
		const isCurrentlyHidden = btn.dataset.isTargetHidden === "true";

		// If global state is HIDDEN, but button says SHOW, click it!
		if (state.hidden && !isCurrentlyHidden) {
			btn.click();
		}
		// If global state is SHOW, but button says HIDDEN, click it!
		else if (!state.hidden && isCurrentlyHidden) {
			btn.click();
		}
	}
}

function createPermanentToggle(targetElement, label, type) {
	// Mark target as processed so we don't attach duplicate buttons
	targetElement.classList.add('de-saff-processed');

	// Setup the initial display state for toggling later
	targetElement.dataset.originalDisplay = targetElement.style.display || '';

	const btn = document.createElement('button');
	btn.classList.add('de-saff-toggle', 'btn', 'inline-action');
	btn.dataset.isTargetHidden = "false"; // Starts visible

	// Dynamic Styling based on your original minimalist logic
	if (type === 'card' && window.deSaffSettings.cardStyleShowButtons) {
		btn.classList.add('note-stream-item', 'card');
	} else {
		btn.style.marginTop = '-5px';
		btn.style.marginBottom = '15px';
	}
	btn.style.marginRight = '10px';

	btn.innerText = `Hide ${label}`;

	// Place it exactly where the hidden element starts
	targetElement.insertAdjacentElement('beforebegin', btn);

	// The Click Event
	btn.onclick = e => {
		e.preventDefault();
		const isHidden = btn.dataset.isTargetHidden === "true";

		if (isHidden) {
			// Show it
			targetElement.style.display = targetElement.dataset.originalDisplay;
			btn.innerText = `Hide ${label}`;
			btn.dataset.isTargetHidden = "false";
		} else {
			// Hide it
			targetElement.dataset.originalDisplay = targetElement.style.display;
			targetElement.style.display = 'none';
			btn.innerText = `Show ${label}`;
			btn.dataset.isTargetHidden = "true";
		}
	};
}

function wrapAndToggleGroup(cards, names) {
	if (cards.length === 0) return;

	const wrapper = document.createElement('div');
	wrapper.classList.add('de-saff-group-wrapper');

	// Insert wrapper before the first card
	const firstCard = cards[0];
	firstCard.parentNode.insertBefore(wrapper, firstCard);

	// Move all cards in the group into the wrapper
	for (const card of cards) {
		card.classList.add('de-saff-processed-card');
		card.style.marginLeft = '20px';
		card.style.marginRight = '-20px';
		wrapper.appendChild(card);
	}

	const label = cards.length > 1
		? `${cards.length} updates from ${names.join(' & ')}`
		: `update from ${names[0]}`;

	createPermanentToggle(wrapper, label, "card");
}

function wrapAndToggleEmailChain(cardElement) {
	// 1. Grab all <hr> and <b> tags in the exact order they appear
	const potentialHeaders = cardElement.querySelectorAll('hr, b');
	let chainHeader = null;

	for (const el of potentialHeaders) {
		if (el.tagName === 'HR') {
			chainHeader = el;
			break;
		} else if (el.tagName === 'B' && el.innerText.trim().startsWith("From:")) {
			chainHeader = el.closest('div[style*="border"]') || el;
			break;
		}
	}

	// Safety check: Don't re-wrap if it's already in our wrapper or if we found nothing
	if (!chainHeader || chainHeader.closest('.de-saff-processed')) return;

	// Try to avoid hiding signatures:
	if (chainHeader.previousElementSibling?.innerText?.includes('Best')) return;
	if (chainHeader.nextElementSibling?.innerText?.includes(getCardName(cardElement))) return;

	const textContainer = cardElement.querySelector('.note-stream-item-text') || cardElement;

	// 2. Create the wrapper and insert it exactly where the chain header starts
	const wrapper = document.createElement('div');
	wrapper.classList.add('de-saff-chain-wrapper');
	chainHeader.parentNode.insertBefore(wrapper, chainHeader);

	// 3. Move the chain header and all its direct siblings into the wrapper
	let current = chainHeader;
	while (current) {
		let next = current.nextSibling;
		wrapper.appendChild(current);
		current = next;
	}

	// 4. Walk up the DOM tree and vacuum up any remaining elements that come
	// after this block, all the way up to the main text container
	let parent = wrapper.parentNode;
	while (parent && parent !== textContainer && parent !== cardElement) {
		let parentSibling = parent.nextSibling;
		while (parentSibling) {
			let next = parentSibling.nextSibling;
			wrapper.appendChild(parentSibling);
			parentSibling = next;
		}
		parent = parent.parentNode;
	}

	createPermanentToggle(wrapper, "email chain", "inline");
}

function getCardName(card) {
	const nameEl = card.querySelector('.note-stream-item-name');
	return nameEl ? nameEl.innerText.trim() : "";
}
