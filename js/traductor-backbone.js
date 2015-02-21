// gotta wrap in .ready for now...
$(document).ready(function() {
  (function($){
    var Word = Backbone.Model.extend({
    });

    // **List class**: A collection of `Item`s. Basically an array of Model objects with some helper functions.
    var VocabList = Backbone.Collection.extend({
      model: Word
    });

    var ListView = Backbone.View.extend({
      el: $('body'),
      events: {
        'click button#add': 'addItem'
      },
      // `initialize()` now instantiates a Collection, and binds its `add` event to own method `appendItem`. (Recall that Backbone doesn't offer a separate Controller for bindings...).
      initialize: function(){
        _.bindAll(this, 'render', 'addItem', 'appendItem'); // remember: every function that uses 'this' as the current object should be in here

        this.collection = new VocabList();
        this.collection.bind('add', this.appendItem); // collection event binder

        this.counter = 0;
        this.render();
      },
      render: function(){
        // Save reference to `this` so it can be accessed from within the scope of the callback below
        var self = this;
        $(this.el).append("<button id='add'>Add list item</button>");
        $(this.el).append("<ul></ul>");
        _(this.collection.models).each(function(item){ // in case collection is not empty
          self.appendItem(item);
        }, this);
      },
      // `addItem()` now deals solely with models/collections. View updates are delegated to the `add` event listener `appendItem()` below.
      addItem: function(){
        this.counter++;
        var item = new Word();
        item.set({
          part2: item.get('part2') + this.counter // modify item defaults
        });
        this.collection.add(item); // add item to collection; view is updated via event 'add'
      },
      // `appendItem()` is triggered by the collection event `add`, and handles the visual update.
      appendItem: function(item){
        $('ul', this.el).append("<li>"+item.get('part1')+" "+item.get('part2')+"</li>");
      }
    });

    var listView = new ListView();
  })(jQuery);
});
