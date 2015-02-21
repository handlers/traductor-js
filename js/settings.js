function getSourceLanguage(fn) {
  chrome.runtime.sendMessage({command: "getSourceLanguage"}, function(response) {
    fn(response['sourceLanguage'])
  });
}

function getTargetLanguage(fn) {
  chrome.runtime.sendMessage({command: "getTargetLanguage"}, function(response) {
    fn(response['targetLanguage']);
  });
}