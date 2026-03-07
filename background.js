// 1. MUST BE THE VERY FIRST LINE
import './lib/browser-polyfill.min.js';

// 2. Initialization on Install
browser.runtime.onInstalled.addListener(async () => {
	browser.contextMenus.create({
		id: "open-settings",
		title: "De-Saff Settings",
		contexts: ["action"]
	});

	try {
		const url = browser.runtime.getURL('settings.json');
		const response = await fetch(url);
		const defaultSettings = await response.json();

		const data = await browser.storage.local.get('deSaffSettings');
		if (!data.deSaffSettings) {
			await browser.storage.local.set({deSaffSettings: defaultSettings});
			console.log("De-Saff: Defaults initialized.");
		}
	} catch (err) {
		console.error("De-Saff: Failed to load defaults:", err);
	}
});

// 3. Handle Extension Icon Click
browser.action.onClicked.addListener(async (tab) => {
	try {
		await browser.scripting.executeScript({
			target: {tabId: tab.id},
			func: () => {
				window.deSaffState = window.deSaffState || {hidden: false};
				window.deSaffState.manualTrigger = true;
			}
		});

		await browser.scripting.executeScript({
			target: {tabId: tab.id},
			files: ['src/content.js']
		});
	} catch (err) {
		console.error("De-Saff: Script injection failed:", err);
	}
});

// 4. Handle Context Menu Click
browser.contextMenus.onClicked.addListener((info) => {
	if (info.menuItemId === "open-settings") {
		browser.runtime.openOptionsPage();
	}
});
