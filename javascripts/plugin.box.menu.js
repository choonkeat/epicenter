(function() {
  var select_html =
  "<span class=\"menu\"></span>";
  Box.add_after_hook(function(index, tweet_json) {
    var that = this;
    tweet_json.menu = $(select_html).appendTo(tweet_json.html_element).click(function(event) {
      var ele = event.target;
      if (ele.id) {
        var fn = tweet_json.html_element[ele.id];
        if (fn) fn.apply(that, [index, tweet_json]);
      }
    });
    $(tweet_json.html_element).
      mouseover(function() { tweet_json.menu.addClass('hover'); }).
      mouseout(function() { tweet_json.menu.removeClass('hover'); });
  });
  Box.prototype.add_menu_action = function(name, html_element, fn) {
    var fn_id = name.replace(/\W+/g, '_');
    var link = $('<a href="#" id="' + fn_id + '">' + name.toLowerCase() + '</a> ').click(function(event) { event.preventDefault(); });
    $('.menu', html_element).append(' &middot; ').append(link)
    html_element[fn_id] = fn;
  }
  Box.prototype.remove_menu_action = function(name, html_element) {
    var fn_id = name.replace(/\W+/g, '_');
    $('.menu #' + fn_id, html_element).remove();
    html_element[fn_id] = null;
  }
})();
