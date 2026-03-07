async function importSettings() {
	const data = await browser.storage.local.get('deSaffSettings');

	if (data.deSaffSettings) {
		window.deSaffSettings = data.deSaffSettings;
	} else {
		// Fallback: If storage is empty, fetch the bundled file as a safety net
		const response = await fetch(browser.runtime.getURL('settings.json'));
		window.deSaffSettings = await response.json();
	}

	window.deSaffSettings.hideUsers = new Set(window.deSaffSettings.hideUsers);
}
