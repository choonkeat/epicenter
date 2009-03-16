(function() {
  // thanks http://blog.josh420.com/archives/2007/10/setting-cursor-position-in-a-textbox-or-textarea-with-javascript.aspx
  function setCaretPosition(elem, caretPos) {
    if (elem != null) {
      if (elem.createTextRange) {
        var range = elem.createTextRange();
        range.move('character', caretPos);
        range.select();
      } else {
        if (elem.selectionStart != null) {
          elem.focus();
          elem.setSelectionRange(caretPos, caretPos);
        } else
          elem.focus();
      }
    }
  }
  var status_form_html =
  "<div class=\"okay\" style=\"display: block; float: " +
  "left;\">\n  <form action=\"{update_status_url}\" me" +
  "thod=\"post\" target=\"_iframe\">\n    <input type=" +
  "\"hidden\" name=\"in_reply_to_status_id\">\n    <te" +
  "xtarea name=\"status\"></textarea>\n    <br />\n   " +
  " <button class=\"send-tweet\">Send</button>\n    or" +
  "\n    <a href=\"#\" class=\"cancel\">Cancel</a>\n  " +
  "</form>\n  <iframe name=\"_iframe\" style=\"display" +
  ": none;\"></iframe>\n</div>";
  var update_status_form = $((status_form_html).supplant(settings.urls));
  $("textarea[name='status']").keyup(function(event) {
    var textarea = $(event.target);
    var parent = textarea.parent();
    if (textarea.val().length <= 140) {
      parent.removeClass('exceed');
    } else {
      parent.addClass('exceed');
    }
  });
  $('.cancel', update_status_form).click(function(event) { event.preventDefault(); update_status_form.hide(); });
  $('.send-tweet', update_status_form).click(function(event) { update_status_form.hide('slow'); });

  Box.add_after_hook(function(index, tweet_json) {
    this.add_menu_action("Reply", tweet_json.html_element, function(index, tweet_json) {
      update_status_form.insertAfter($('.menu:first', tweet_json.html_element)).show();
      $("input[name='in_reply_to_status_id']").val(tweet_json.id);
      var textarea = $("textarea[name='status']");
      textarea.val("@" + tweet_json.user.screen_name + " ");
      setCaretPosition(textarea[0], textarea.val().length);
    });
    this.add_menu_action("Direct message", tweet_json.html_element, function(index, tweet_json) {
      update_status_form.insertAfter($('.menu:first', tweet_json.html_element)).show();
      $("input[name='in_reply_to_status_id']").val("");
      var textarea = $("textarea[name='status']");
      textarea.val("d " + tweet_json.user.screen_name + " ");
      setCaretPosition(textarea[0], textarea.val().length);
    });
  });
})();