function fixDarkMode() {
	const darkModeEnabled = document.querySelector('html').classList.contains('dark');
	console.log('dark mode is', darkModeEnabled);

	if (window.deSaffSettings.fixDarkModeText && darkModeEnabled) {
		// 1. Grab only elements that have an inline style attribute
		const styledElements = document.querySelectorAll('[style]');

		for (const el of styledElements) {
			// 2. Read the parsed JavaScript style setting, and strip spaces
			// so "rgb(0, 0, 0)" and "rgb(0,0,0)" become identical to check.
			const textColor = el.style.color.replace(/\s/g, '').toLowerCase();
			const bgColor = el.style.backgroundColor.replace(/\s/g, '').toLowerCase();

			// 3. Check if the parsed setting matches any variation of black
			if (textColor === 'rgb(0,0,0)' || textColor === '#000000' || textColor === 'black' || textColor === '#000') {
				console.log('found font color:', el.innerText);
				el.style.color = 'rgb(207, 208, 209)';
			}

			// 4. Check if the parsed setting matches any variation of white
			if (bgColor === 'rgb(255,255,255)' || bgColor === '#ffffff' || bgColor === 'white' || bgColor === '#fff') {
				console.log('found background color:', el.innerText);
				el.style.backgroundColor = 'transparent'; // 'none' is invalid CSS
			}
		}
	}
}
