function initKeyboardNavigation() {
	if (!window.deSaffSettings.enableKeyboardNavigation) return;
	if (window.deSaffKeyboardInitialized) return;
	window.deSaffKeyboardInitialized = true;

	window.addEventListener('keyup', function (e) {
		if (!e.ctrlKey) return;

		// 2. Ignore if the user is typing in an input or textarea
		const activeElem = document.activeElement;
		const isInput = activeElem.tagName === 'INPUT' ||
			activeElem.tagName === 'TEXTAREA' ||
			activeElem.isContentEditable;

		if (isInput) return;

		// 3. Handle Navigation
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			document.querySelector('[alt=Prev], [title=Prev]')?.click();
		}

		if (e.key === 'ArrowRight') {
			e.preventDefault();
			document.querySelector('[alt=Next], [title=Next]')?.click();
		}
	});
}
