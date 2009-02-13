(function() {
  var select_html =
  "<select class=\"menu\">\n  <option>-- choose --</op" +
  "tion>\n</select>";
  Box.add_after_hook(function(index, item) {
    var that = this;
    item.menu = $(select_html).appendTo(item.html_element).change(function(event) {
      var fn = item.html_element[$(this).val()];
      if (fn) fn.apply(that, [index, item]);
    });
    $(item.html_element).
      mouseover(function() { item.menu.show(); }).
      mouseout(function() { item.menu.hide(); });
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
