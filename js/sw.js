chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    if (changeInfo.url) {
		chrome.tabs.sendMessage( tabId, {
        message: 'bingEnhancer',
        url: changeInfo.url
      })
	}
});
