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
      jQuery.log("throttled", arguments, this.calls[this.calls.length-1]);
    } else {
      jQuery.log("calling ", arguments);
      if (settings.debug_callback) window.debug_callback = arguments[1];
      return old_jQuery_getJSON.apply(jQuery, arguments);
    }
  };
  jQuery.time_ago = function(str) {
    function quantity(num, unit) {
      return parseInt(num) + " " + unit + (num >= 2 ? "s" : "");
    }
    var date = Date.parse(str), diff = 0;
    if (isNaN(date)) {
      date = new Date(str.replace(/-/g,"/").replace(/[TZ]/g," ").replace(/[\-\+](\d\d):(\d\d)$/, ""));
      var match = str.match(/([\-\+])(\d\d):(\d\d)/);
      if (match) {
        diff = (match[2] * 60) + (match[3] * 1);
        if (match[1] == '-') diff = diff * -1;
      }
    }
    var diff_minutes = (((new Date()).getTime() - date) / 1000 / 60) + diff;
    if (diff_minutes < 1) {
      return "moments ago";
    } else if (diff_minutes < 60) {
      return quantity(diff_minutes, "minute") + ' ago';
    } else if (diff_minutes < 1440) {
      return quantity((diff_minutes / 60), "hour") + ' ago';
    } else if (diff_minutes < 43200) {
      return quantity((diff_minutes / 1440), "day") + ' ago';
    } else {
      return quantity((diff_minutes / 43200), "month") + ' ago';
    }
  }
  jQuery.fn.time_ago = function() {
    return this.each(function() {
      if (! this.time_ago) {
        this.time_ago = true;
        jQuery(this).html(jQuery.time_ago(this.title || jQuery(this).text()));
      }
    });
  }
  jQuery.log = function() { };
})();
