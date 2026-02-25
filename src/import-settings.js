async function importSettings() {
	const data = await chrome.storage.local.get('deSaffSettings');

	if (data.deSaffSettings) {
		window.deSaffSettings = data.deSaffSettings;
	} else {
		// Fallback: If storage is empty, fetch the bundled file as a safety net
		const response = await fetch(chrome.runtime.getURL('settings.json'));
		window.deSaffSettings = await response.json();
	}
}
