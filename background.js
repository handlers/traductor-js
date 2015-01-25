console.log('yo')

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      
      chrome.browserAction.setIcon({
          path: request.newIconPath,
          tabId: sender.tab.id
      });
  });
