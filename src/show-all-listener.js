document.addEventListener('click', (event) => {
	// 1. Check if the clicked element is the "Show All" button
	if (event.target.matches('a.btn.accent') && event.target.innerText.trim() === "Show All") {

		console.log("De-Saff: 'Show All' clicked. Waiting for history to load...");

		// 2. Wait for HelpSpot's AJAX to finish.
		const checkLoad = setInterval(() => {
			const loadingMsg = document.querySelector('#note-stream-load-more');

			// THE FIX: Trigger if the element was completely removed (!loadingMsg)
			// OR if it's still there but the loading gif stopped
			if (!loadingMsg || !loadingMsg.innerHTML.includes('gif')) {
				clearInterval(checkLoad);

				// Extra 300ms cushion for HelpSpot's internal scripts to finish rendering
				setTimeout(() => {
					console.log("De-Saff: History loaded. Injecting and syncing...");

					injectToggles();
					applyGlobalState();

				}, 300);
			}
		}, 500);

		// Safety timeout: stop looking after 10 seconds if it fails
		setTimeout(() => clearInterval(checkLoad), 10000);
	}
}, true);
