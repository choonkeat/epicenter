// thanks http://javascript.crockford.com/remedial.html
String.prototype.supplant = function (o) {
  return this.replace(/{([^{}]*)}/g, function (a, b) {
    var r = o[b]; return typeof r === 'string' || typeof r === 'number' ? r : a;
  });
};
(function() {
  var old_jQuery_getJSON = jQuery.getJSON;
  jQuery.getJSON = function(url) {
    var limited_request = url.match(/http\:\/\/twitter.com\//);
    if (limited_request) {
      var now = new Date();
      (settings.history ? settings.history.unshift(now) : settings.history = [now]);
      while ((now - settings.history[settings.history.length-1]) > settings.max_msec) { settings.history.pop(); }
    }
    if (limited_request && settings.history.length >= settings.max_count) {
      console.log("throttled", arguments, this.calls[this.calls.length-1]);
    } else {
      console.log("calling ", arguments);
      window.debug_callback = arguments[1];
      return old_jQuery_getJSON.apply(jQuery, arguments);
    }
  }
})();
