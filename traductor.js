function getSelectedText() {
  var text = "";
  if (typeof window.getSelection != "undefined") {
    text = window.getSelection().toString();
  } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
    text = document.selection.createRange().text;
  }
  return text;
}

function translateText(text) {
  from_lang = "spa"
  to_lang = "eng"
  url = "http://developer.ultralingua.com/api/definitions/" + from_lang + "/" + to_lang + "/" + text
  return $.getJSON(url).then(function(data){
    return data;
  })
}

function makeTranslationContainer(text) {
  translation_container = '<div class="_traductor">' +
    '<div class="_traductor_quit_container"><span class="_traductor_quit">x</span></div>' +
    '<div class="_traductor_header">' + text + "</div>" +
    '<div class="_traductor_body">' +
    '<button class="_traductor_translate">Get Definition</button>' +
    '</div><div class="_traductor_clear"></div></div>'
  return $(translation_container).prependTo("body")
}

function positionTranslationContainer(x_coordinate, y_coordinate) {
  $("._traductor").offset({ top: y_coordinate, left: x_coordinate })
}

function killTraductor() {
  $("._traductor").remove();
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
    definition.partofspeech + '</span>: ' +
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
  definition.partofspeech = obj.partofspeech.partofspeechdisplay;
  definition.text = obj.text;
  definition.clarifications = obj.clarification
  return definition;
}

function traductorIsShowing() {
  return $('._traductor').length > 0
}

$(document).on("mouseup", function(e){
  text = getSelectedText(); 
  if (text && !traductorIsShowing()) {
    translation_container = makeTranslationContainer(text);
    positionTranslationContainer(e.pageX, e.pageY);
  }
});

$(document).on('click', '._traductor_translate', function(e) {
  translateText(text).done(function(result) {
    translation_markup = buildTranslationMarkup(result);
    $("._traductor_body").html(translation_markup);
  });
})

$(document).on('click', '._traductor_quit', function(e) {
  killTraductor();
})

$(document).on('mousedown', 'body', function(e){
  if ($(e.target).parents("._traductor").length < 1) {
    killTraductor();
  }
});
