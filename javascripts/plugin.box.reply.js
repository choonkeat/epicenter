Box.add_after_hook(function(index, tweet_json) {
  this.add_menu_action("Reply", tweet_json.html_element, function(index, tweet_json) {
    window.open(settings.urls.reply_to_url.supplant(tweet_json).supplant(tweet_json.user), '_blank');
  });
});
