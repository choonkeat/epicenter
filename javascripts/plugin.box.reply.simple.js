(function() {
  Box.add_after_hook(function(index, tweet_json) {
    this.add_menu_action("Reply", tweet_json.html_element, function(index, tweet_json) {
      window.open(settings.urls.twitter_home_url.supplant({status: "@" + tweet_json.user.screen_name + "+" }));
    });
    this.add_menu_action("Direct message", tweet_json.html_element, function(index, tweet_json) {
      window.open(settings.urls.twitter_home_url.supplant({status: "d " + tweet_json.user.screen_name + "+" }));
    });
  });
})();