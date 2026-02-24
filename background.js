// 1. Initialization on Install
chrome.runtime.onInstalled.addListener(async () => {
	// Create the Right-Click Menu
	chrome.contextMenus.create({
		id: "open-settings",
		title: "De-Saff Settings",
		contexts: ["action"]
	});

	// Load defaults from bundled JSON into Storage
	try {
		const response = await fetch(chrome.runtime.getURL('settings.json'));
		const defaultSettings = await response.json();

		// Check if settings already exist to avoid overwriting user changes on update
		const data = await chrome.storage.local.get('deSaffSettings');
		if (!data.deSaffSettings) {
			await chrome.storage.local.set({deSaffSettings: defaultSettings});
			console.log("De-Saff: Defaults initialized.");
		}
	} catch (err) {
		console.error("De-Saff: Failed to load defaults:", err);
	}
});

// 2. Handle Extension Icon Click (Toggle Logic)
chrome.action.onClicked.addListener((tab) => {
	// We first inject a small piece of code to set the manual trigger flag.
	// This tells content.js that the user explicitly wants to flip the current state.
	chrome.scripting.executeScript({
		target: {tabId: tab.id},
		func: () => {
			window.simplifyHelpspotState = window.simplifyHelpspotState || {hidden: false};
			window.simplifyHelpspotState.manualTrigger = true;
		}
	}).then(() => {
		// After setting the flag, we run the actual content script.
		chrome.scripting.executeScript({
			target: {tabId: tab.id},
			files: ['content.js']
		});
	});
});

// 3. Handle Context Menu Click
chrome.contextMenus.onClicked.addListener((info) => {
	if (info.menuItemId === "open-settings") {
		chrome.runtime.openOptionsPage();
	}
});
