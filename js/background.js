chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.command == "getSourceLanguage") {
      sendResponse({
        sourceLanguage: localStorage.getItem("_tr_source_language")
      });
    }
    else if (request.command == "getTargetLanguage") {
      sendResponse({
        targetLanguage: localStorage.getItem("_tr_target_language")
      });  
    }
    else if (request.command == "setLanguage") {
      localStorage.setItem(request.params.key, request.params.val);
      sendResponse({
        source_language: localStorage.getItem("_tr_source_language"),
        target_language: localStorage.getItem("_tr_target_language")
      });
      getTabIDs(sendRefreshSignal);
    }
  });

function getTabIDs(fn) {
  chrome.tabs.query({currentWindow: true}, function(response) {
    tab_ids = [];
    $.each(response, function( index, value ) {
      tab_ids.push(value.id);
    });
    fn(tab_ids);
  });
}

function sendRefreshSignal(tab_ids) {
  $.each(tab_ids, function( index, value ) {
    chrome.tabs.sendMessage(value, {command: "refreshSettings"})
  });
}
