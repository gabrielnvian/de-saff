// Define the keys we expect to find in our HTML/JSON
const SETTING_KEYS = [
	'runOnLoad',
	'onlyPrivate',
	'hideAttachments',
	'hideEmailChains',
	'hideStatusUpdates',
	'hideUsers'
];

// Initialize the page
document.addEventListener('DOMContentLoaded', loadSettings);
document.getElementById('save').addEventListener('click', saveSettings);
document.getElementById('reset').addEventListener('click', resetToDefaults);

async function loadSettings() {
	const data = await chrome.storage.local.get('deSaffSettings');
	const settings = data.deSaffSettings;

	if (!settings) return;

	SETTING_KEYS.forEach(key => {
		const input = document.getElementById(key);
		if (!input) return;

		if (input.type === 'checkbox') {
			input.checked = settings[key];
		} else if (input.tagName === 'TEXTAREA') {
			input.value = settings[key].join(', ');
		}
	});
}

async function saveSettings() {
	const updatedSettings = {};

	SETTING_KEYS.forEach(key => {
		const input = document.getElementById(key);
		if (!input) return;

		if (input.type === 'checkbox') {
			updatedSettings[key] = input.checked;
		} else if (input.tagName === 'TEXTAREA') {
			updatedSettings[key] = input.value.split(',').map(s => s.trim()).filter(s => s !== "");
		}
	});

	await chrome.storage.local.set({deSaffSettings: updatedSettings});

	// Visual Feedback
	const saveBtn = document.getElementById('save');
	const originalText = saveBtn.innerText;
	saveBtn.innerText = "Saved!";
	setTimeout(() => saveBtn.innerText = originalText, 1500);
}

async function resetToDefaults() {
	if (!confirm("Are you sure you want to reset to the default settings?")) return;

	const response = await fetch(chrome.runtime.getURL('settings.json'));
	const defaultSettings = await response.json();

	await chrome.storage.local.set({deSaffSettings: defaultSettings});
	loadSettings(); // Reload UI with the defaults
}
