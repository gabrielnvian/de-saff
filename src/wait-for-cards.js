// Helper function to wait for HelpSpot notes to appear
async function waitForCards() {
	return new Promise((resolve) => {
		if (document.querySelector('div.note-stream-item')) {
			resolve(true);
			return;
		}

		const observer = new MutationObserver(() => {
			if (document.querySelector('div.note-stream-item')) {
				observer.disconnect();
				resolve(true);
			}
		});

		observer.observe(document.body, {childList: true, subtree: true});

		// Safety timeout: give up after 5 seconds
		setTimeout(() => {
			observer.disconnect();
			resolve(false);
		}, 5000);
	});
}
