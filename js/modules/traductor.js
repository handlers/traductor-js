define(['modules/settings', 'modules/templates', 'lib/underscore', 'jquery'], function(w,templates) {
  var selected_text_cache = "";
  var definition_cache = {};
  var source_language = "es";
  var target_language = "en";
  var parts_of_speech_map = {
    pronoun: 'pron',
    noun: 'n',
    adjective: 'adj',
    adverb: 'adv',
    preposition: 'prep', 
    verb: 'v',
    expression: 'expr'
  }

  //chrome.runtime.onMessage.addListener(
  //  function(request, sender, sendResponse) {
  //    if (request.command == "refreshSettings") {
  //      getSourceLanguage(function(r){source_language = r});
  //      getTargetLanguage(function(r){target_language = r});
  //    }
  //  });

  //getSourceLanguage(function(r){source_language = r});
  //getTargetLanguage(function(r){target_language = r});

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
    return /\w+\s\w/.test($.trim(text));
  }

  function translateText(text, source_lang, target_lang) {  
    url = "http://developer.ultralingua.com/api/definitions/" + source_lang + "/" + target_lang + "/" + text;
    return $.getJSON(url, function(data){return data;})
  }

  function makeTranslationContainer(text) {
    rendered_template = _.template(templates.definition)({
      term: text,
      wr_url: makeWordReferenceURL(text),
      list_toggle: "Add to list",
      outside_link: "No link"
    })
    return $(rendered_template).prependTo("body");
  }

  function positionTranslationContainer(x_coordinate, y_coordinate, y_offset) {
    $("._traductor").offset({ 
      top: y_coordinate + parseInt(y_offset),
      left: x_coordinate
    })
  }

  function buildTranslationMarkup(result) {
    result_for_display = result.map(function(r) {
      return parseDefinitionObject(r)
    });
    rendered_template = _.template(templates.translation)({
      definitions: result_for_display
    });
    return rendered_template;
  }

  function buildVocabListMarkup(words) {
    list_markup = "";
    $.each(words, function(word, definitions) {
      list_markup += _.template(templates.vocab_list_item)({
        word: word,
        definitions_markup: buildTranslationMarkup(definitions)
      });
    });
    return list_markup
  }

  function renderVocabList(words) {
    $("._traductor_vocab_list").html(
      _.template(templates.vocab_list)({
        words_markup: buildVocabListMarkup(words)
      })
    );
  }

  function parseDefinitionObject(obj) {
    definition = {};
    definition.partofspeech = abbreviatePartOfSpeech(
      obj.partofspeech.partofspeechdisplay
    );
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

  function toggleItemExport(word) {
    toggleItemExportAttribute(word);
    toggleExportButtonText(word);
    renderVocabList(getExportableVocab());
  }

  function toggleItemExportAttribute(text) {
    if (definition_cache[text]["export"] === undefined)
      definition_cache[text]["export"] = true;
    else {
      definition_cache[text]["export"] = !definition_cache[text]["export"]
    }
  }

  function toggleExportButtonText(word) {
    button = $('*[data-word="' + word + '"]');
    text = $.trim(button.text())
    if (text === "Add to list") {
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

  // This is ugly but trying to use a template is, in fact, uglier
  function formatVocabAsCSV(definitions, include_header) {
    include_header = typeof include_header !== 'undefined' ? include_header : false;
    output = include_header ? "word, definition\n" : "" 
    $.each(definitions, function(word, definitions) {
      output += "\"" + word + "\",\""
      definitions_count = definitions.length
      $.each(definitions, function(i, definition) {
        include_newline = definitions_count === i + 1 ? false : true 
        buildDefinitionText(parseDefinitionObject(definition), include_newline);
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
    if (text && !hasSpaces(text) && !traductorIsShowing()) {
      setSelectedTextCache(text);
      y_offset = $(e.target).css('line-height');
      translation_container = makeTranslationContainer(text);
      positionTranslationContainer(e.pageX, e.pageY, y_offset);
    }
  });

  // Create nav
  $(document).ready(function() {
    $("body").append(_.template(templates.vocab_list)({words_markup:""}))
  });

  // Translation
  $(document).on('click', '._traductor_translate', function(e) {
    text = getSelectedTextCache();
    setSelectedTextCache("");
    translateText(text, source_language, target_language).done(function(result) {
      markup = buildTranslationMarkup(result);
      definition_cache[text] = result;     
      $("._traductor_body").html(markup);
      $("._traductor_list_toggle").attr("data-word", text)
      $("._traductor_list_toggle").show();
    }).fail(function(jqXHR) {
      markup = "<span class='_traductor_error'>Error getting definition...</span>";
      $("._traductor_body").html(markup);
    });
  })

  // exporting
  $(document).on('click', '._traductor_list_toggle', function(e) {
    toggleItemExport($("._traductor_list_toggle").attr("data-word"))
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
});
