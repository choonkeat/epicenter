(function() {
  var select_html =
  "<select class=\"menu\">\n  <option>- ? -</option>\n" +
  "</select>";
  Box.add_after_hook(function(index, tweet_json) {
    var that = this;
    tweet_json.menu = $(select_html).prependTo(tweet_json.html_element).change(function(event) {
      var fn = tweet_json.html_element[$(this).val()];
      if (fn) fn.apply(that, [index, tweet_json]);
    });
    $(tweet_json.html_element).
      mouseover(function() { tweet_json.menu.show(); }).
      mouseout(function() { tweet_json.menu.hide(); });
  });
  Box.prototype.add_menu_action = function(name, html_element, fn) {
    var fn_id = name.replace(/\W+/g, '_');
    $('.menu', html_element).append('<option value="' + fn_id + '" id="' + fn_id + '">' + name + '</option>');
    html_element[fn_id] = fn;
  }
  Box.prototype.remove_menu_action = function(name, html_element) {
    var fn_id = name.replace(/\W+/g, '_');
    $('.menu #' + fn_id, html_element).remove();
    html_element[fn_id] = null;
  }
})();
