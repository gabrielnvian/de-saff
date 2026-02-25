function fixDarkMode() {
	const darkModeEnabled = document.querySelector('html').classList.contains('dark');

	if (window.deSaffSettings.fixDarkModeText && darkModeEnabled) {
		for (const el of document.querySelectorAll('[style*="color: #000000"]')) {
			el.style.color = 'white';
		}

		for (const el of document.querySelectorAll('[style*="background-color: #ffffff"]')) {
			el.style.backgroundColor = 'none';
		}
	}
}
