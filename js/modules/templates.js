define(['lib/underscore', 'text!templates/definition.html', 'text!templates/translation.html'], function(u,definition_temp, translation_temp, vocab_list_temp) {
  return {
    definition: definition_temp,
    translation: translation_temp,
    vocab_list: vocab_list_temp
  };
});
