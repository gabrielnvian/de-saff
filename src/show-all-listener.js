document.addEventListener('click', (event) => {
	if (!event.target.matches('a.btn.accent') || event.target.innerText.trim() !== "Show All") return;

	const loadingMsg = document.querySelector('#note-stream-load-more');
	if (!loadingMsg) {
		injectToggles();
		applyGlobalState();
		return;
	}

	const observer = new MutationObserver(() => {
		if (!document.querySelector('#note-stream-load-more')) {
			observer.disconnect();
			injectToggles();
			applyGlobalState();
		}
	});

	observer.observe(document.body, {childList: true, subtree: true});
	setTimeout(() => observer.disconnect(), 15_000);
}, true);
