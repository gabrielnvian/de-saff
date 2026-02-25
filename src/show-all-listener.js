document.addEventListener('click', (event) => {
	// 1. Check if the clicked element is the "Show All" button
	if (event.target.matches('a.btn.accent') && event.target.innerText.trim() === "Show All") {

		// 2. Wait for HelpSpot's AJAX to finish.
		const checkLoad = setInterval(() => {
			const loadingMsg = document.querySelector('#note-stream-load-more');

			// Still loading, try again later
			if (loadingMsg) return;

			clearInterval(checkLoad);

			injectToggles();
			applyGlobalState();
		}, 50);

		// Safety timeout: stop looking after 15 seconds if it fails
		setTimeout(() => clearInterval(checkLoad), 15_000);
	}
}, true);
