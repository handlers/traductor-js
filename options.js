var language_map = {
  spa: "Spanish",
  deu: "German",
  eng: "English",
  fra: "French",
  ita: "Italian",
  por: "Portuguese"
};

var iso_to_ultralingua_map = {
  en: "eng"
}

function traductorText(from, to) {
  return "Translating from " + language_map[from] + " to " + language_map[to];
}

function flashStatusMessage(from, to) {
  $("._traductor_status").show();
  $("._traductor_status").html(traductorText(from, to));
  $("._traductor_status").fadeOut(2000);
}

function setLanguage(direction, value) {
  message = {
    command: "setLanguage",
    params: {
      key: direction,
      val: value
    }
  };
  chrome.runtime.sendMessage(message, function(r){
    flashStatusMessage(r.source_language, r.target_language);
  });
}

function initializeLanguages() {
  // Todo: add automatic language detection
  getSourceLanguage(function(r) {
    $("._traductor_source_language").val(r);
  });
  getTargetLanguage(function(r) {
    $("._traductor_target_language").val(r);
  });
}

$(document).ready(function() {
  initializeLanguages();
  $("._traductor_source_language, ._traductor_target_language").change(function() {
      setLanguage($(this).attr("name"), $(this).val());
    }
  );
});

