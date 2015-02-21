function getSourceLanguage(fn) {
  return "spa";
  //chrome.runtime.sendMessage({command: "getSourceLanguage"}, function(response) {
  //  fn(response['sourceLanguage'])
  //});
}

function getTargetLanguage(fn) {
  return "eng";
  //chrome.runtime.sendMessage({command: "getTargetLanguage"}, function(response) {
  //  fn(response['targetLanguage']);
  //});
}