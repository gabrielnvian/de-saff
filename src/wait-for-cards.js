// Helper function to wait for HelpSpot notes to appear
async function waitForCards() {
	return new Promise((resolve) => {
		let attempts = 0;
		const check = setInterval(() => {
			const cards = document.querySelectorAll("div.note-stream-item");
			if (cards.length > 0) {
				clearInterval(check);
				resolve(true);
			}
			if (attempts > 10) { // Give up after 5 seconds (10 * 500ms)
				clearInterval(check);
				resolve(false);
			}
			attempts++;
		}, 100);
	});
}
