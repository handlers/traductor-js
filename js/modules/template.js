define(['lib/underscore', 'jquery', 'text!templates/definition.html'], function(x,y,z) {
  var showName = function(n) {
    var temp = _.template(z);
    $("body").html(temp({name: n}));
  };
  return {
    showName: showName
  };
});