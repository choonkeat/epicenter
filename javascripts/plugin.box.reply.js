Box.add_after_hook(function(index, item) {
  this.add_menu_action("Reply", item.html_element, function(index, item) {
    window.open(settings.urls.reply_to_url.supplant(item).supplant(item.user), '_blank');
  });
});
