define(['lib/underscore', 'text!templates/definition.html', 'text!templates/translation.html', 'text!templates/vocab_list.html', 'text!templates/vocab_list_item.html'], function(u,definition_temp, translation_temp, vocab_list_temp, vocab_list_item_temp) {
  return {
    definition: definition_temp,
    translation: translation_temp,
    vocab_list: vocab_list_temp,
    vocab_list_item: vocab_list_item_temp
  };
});
