/*
  Epicenter Javascript library
  Copyright (C) 2009 Chew Choon Keat

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/*
 * Plucks "<li>" elements (individual tweets) and place them
 * under corresponding tweets, creating conversation threads
 *
 * if corresponding tweet cannot be found, add a "see thread"
 * link, and dynamically pull it in if user clicks
 */
(function() {
  function get_in_reply_to(that, tweet_json) {
    var in_reply_to = jQuery('.tweet-' + tweet_json.in_reply_to_status_id, that.ol);
    return in_reply_to;
  }

  function add_thread_link(that, tweet_json) {
    that.add_menu_action("See thread", tweet_json.html_element, function(index, tweet_json) {
      var in_reply_to = get_in_reply_to(that, tweet_json);
      if (in_reply_to.length > 0) return attach_to_parent(that, tweet_json);
      var status_url = settings.urls.status_url.supplant({ status_id: tweet_json.in_reply_to_status_id });
      jQuery.getJSON(status_url, function(json) {
        that.render_tweet(0, json);
        attach_to_parent(that, tweet_json);
      });
      $(tweet_json.html_element).addClass('seen-thread');
      that.remove_menu_action("See thread", tweet_json.html_element);
    });
  }

  function attach_to_parent(that, tweet_json, first_attempt) {
    var in_reply_to = get_in_reply_to(that, tweet_json);
    if (in_reply_to.length > 0) {
      var new_tweet_li = jQuery('.tweet-' + tweet_json.id, that.ol);
      if ((that.read_id == tweet_json.in_reply_to_status_id) && in_reply_to.next()[0]) {
        var match = "" + in_reply_to.next()[0].className.match(/tweet-(\d+)/);
        that.mark_read(match[0]);
      }
      new_tweet_li.append(in_reply_to);
    } else if (first_attempt) {
      add_thread_link(that, tweet_json);
    }
  }

  Box.add_after_hook(function(index, tweet_json) {
    var that = this;
    if (tweet_json.in_reply_to_status_id) setTimeout(function() { attach_to_parent(that, tweet_json, true); }, 500);
  });
})();
