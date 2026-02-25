function initKeyboardNavigation() {
	if (!window.deSaffSettings.enableKeyboardNavigation) return;

	window.addEventListener('keyup', function (e) {
		if (!e.ctrlKey) return;

		if (e.key === 'ArrowLeft') {
			e.preventDefault(); // Prevent default browser behavior if needed

			document.querySelector('[alt=Prev]').click();
		}

		if (e.key === 'ArrowRight') {
			e.preventDefault(); // Prevent default browser behavior if needed

			document.querySelector('[alt=Next]').click();
		}
	});
}
