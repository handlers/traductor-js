var selected_text_cache = "";
var definition_cache = {};
var source_language = "";
var target_language = "";
var parts_of_speech_map = {
  pronoun: 'pron',
  noun: 'n',
  adjective: 'adj',
  adverb: 'adv',
  preposition: 'prep', 
  verb: 'v',
  expression: 'expr'
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.command == "refreshSettings") {
      getSourceLanguage(function(r){source_language = r});
      getTargetLanguage(function(r){target_language = r});
    }
  });

getSourceLanguage(function(r){source_language = r});
getTargetLanguage(function(r){target_language = r});


function getSelectedText() {
  var text = "";
  if (typeof window.getSelection != "undefined") {
    text = window.getSelection().toString();
  } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
    text = document.selection.createRange().text;
  }
  return text;
}

function setSelectedTextCache(text) {
  selected_text_cache = text;
  return selected_text_cache;
}

function getSelectedTextCache() {
  return selected_text_cache;
}

function hasSpaces() {
  return /\w+\s\w/.test(text.trim());
}

function translateText(text, source_lang, target_lang) {  
  url = "http://developer.ultralingua.com/api/definitions/" + source_lang + "/" + target_lang + "/" + text;
  return $.getJSON(url, function(data){return data;})
}

function makeTranslationContainer(text) {
  translation_container = '<div class="_traductor">' +
    '<div class="_traductor_quit_container"><span class="_traductor_quit">x</span></div>' +
    '<div class="_traductor_header"><span class="_traductor_term">' + text +
    '</span><a href="' + makeWordReferenceURL(text) +
    '" target="_blank"> (WordReference def.)</a></div>' +
    '<div class="_traductor_body">' +
    '<span class="_traductor_translate">Get Definition</span>' +
    '</div><div class="_traductor_clear"></div>' +
    '<button class="_traductor_list_toggle">Add to list</button>' +
    '<a class="_traductor_export">Export</a>' +
    '<div class="_traductor_clear"></div>' +
    '<div class="_traductor_outside_link"></div>' +
    '<hr/><div class="_traductor_ultralingua">Data by ' +
    '<a href="http://www.Ultralingua.com">Ultralingua</a>' + 
    '</div></div>'
  return $(translation_container).prependTo("body");
}

function positionTranslationContainer(x_coordinate, y_coordinate, y_offset) {
  $("._traductor").offset({ top: y_coordinate + parseInt(y_offset), left: x_coordinate })
}

function buildTranslationMarkup(result) {
  translation_markup = "<ul>"
  $.each(result, function(i, obj) {
    translation_markup += buildListItemMarkup(obj)
  });
  return translation_markup += "</ul>"
}

function buildListItemMarkup(obj) {
  definition = parseDefinitionObject(obj)
  list_item_markup = '<li class="_traductor_definition">' +
    '<span class="_traductor_part_of_speech">' + 
    definition.partofspeech + '</span>. ' +
    buildClarificationsMarkup(definition.clarifications) +
    '<span class="_traductor_definition">' + 
    definition.text + '</span>' +
    '</li>'
  return list_item_markup;
}

function buildClarificationsMarkup(clarifications) {
  clarifications_markup = ""
  if (clarifications !== undefined) {
    $.each(clarifications, function(i, c) {
      clarifications_markup += '<span class="_traductor_clarification">('
      clarifications_markup += clarifications[i]
      clarifications_markup +=')</span> '
    });
  }
  return clarifications_markup;
}

function parseDefinitionObject(obj) {
  definition = {};
  definition.partofspeech = abbreviatePartOfSpeech(obj.partofspeech.partofspeechdisplay);
  definition.text = obj.text;
  definition.clarifications = obj.clarification
  return definition;
}

function abbreviatePartOfSpeech(partofspeech) {
  return parts_of_speech_map[partofspeech] === undefined ? partofspeech : parts_of_speech_map[partofspeech];
}

function traductorIsShowing() {
  return $('._traductor').length > 0
}

function killTraductor() {
  $("._traductor").remove();
}

function makeWordReferenceURL(text) {
  return "http://www.wordreference.com/es/en/translation.asp?spen=" + text;
}

function toggleItemExport(text) {
  toggleItemExportAttribute(text);
  toggleExportButtonText(text);
}

function toggleItemExportAttribute(text) {
  if (definition_cache[text]["export"] === undefined)
    definition_cache[text]["export"] = true;
  else {
    definition_cache[text]["export"] = !definition_cache[text]["export"]
  }
}

function toggleExportButtonText() {
  button = $("._traductor_list_toggle");
  if (button.text() === "Add to list") {
    button.text("Remove from list");
  } else {
    button.text("Add to list");
  }
}

function exportVocab() {
  exportable = getExportableVocab();
  formatted_vocab = formatVocab(exportable, "csv");
  $("._traductor_export").attr('href', "data:application/octet-stream;charset=utf-8," + encodeString(formatted_vocab))
}

function encodeString(string) {
  return encodeURIComponent(string);
}

function getExportableVocab() {
  exportable = {};
  $.each(definition_cache, function(index, value) {
    if (value['export'] === true) {
      exportable[index] = value
    }
  })
  return exportable;
}

function formatVocab(definitions, format) {
  var r
  switch (format) {
    case "csv":
      r = formatVocabAsCSV(definitions);
  }
  return r;
}

function formatVocabAsCSV(definitions, include_header) {
  include_header = typeof include_header !== 'undefined' ? include_header : false;
  output = include_header ? "word, definition\n" : "" 
  $.each(definitions, function(index, value) {
    output += "\"" + index + "\",\""
    definitions_count = value.length
    $.each(value, function(i, v) {
      include_newline = definitions_count === i + 1 ? false : true 
      buildDefinitionText(parseDefinitionObject(v), include_newline);
    })
    output += "\"\n";
  });
  return output;
}

function buildDefinitionText(definition, include_newline) {
  partofspeech = definition['partofspeech'];
  text = definition['text'];
  clarifications = definition['clarifications'];
  output += partofspeech + ". ";
  if (clarifications !== undefined) {
    output += "(" + clarifications + ") ";
  };
  output += text;
  if (include_newline) { 
    output += "\n";
  };
  return output;
}

// bindings //

// Opening popup
$(document).on("mouseup", function(e){
  text = getSelectedText();
  //don't open popup if text has no spaces
  if (text && !hasSpaces(text) && !traductorIsShowing()) {
    setSelectedTextCache(text);
    y_offset = $(e.target).css('line-height');
    translation_container = makeTranslationContainer(text);
    positionTranslationContainer(e.pageX, e.pageY, y_offset);
  }
});

// Translation
$(document).on('click', '._traductor_translate', function(e) {
  text = getSelectedTextCache();
  setSelectedTextCache("");
  translateText(text, source_language, target_language).done(function(result) {
    markup = buildTranslationMarkup(result);
    definition_cache[text] = result;
    $("._traductor_body").html(markup);
    $("._traductor_list_toggle").show();
  }).fail(function(jqXHR) {
    markup = "<span class='_traductor_error'>Error getting definition...</span>";
    $("._traductor_body").html(markup);
  });
})

// exporting
$(document).on('click', '._traductor_list_toggle', function(e) {
  toggleItemExport($("._traductor_term").text())
})

$(document).on('click', '._traductor_export', function(e){
  exportVocab();
});

// various ways to quit
$(document).on('click', '._traductor_quit', function(e) {
  killTraductor();
})

$(document).on('mousedown', 'body', function(e){
  if ($(e.target).parents("._traductor").length < 1) {
    killTraductor();
  }
});

$(document).keyup(function(e) {
  if (e.keyCode == 27) {
    killTraductor();
  }
});
