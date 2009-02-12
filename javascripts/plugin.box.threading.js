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
  function get_in_reply_to(that, item) {
    var in_reply_to = jQuery('.tweet-' + item.in_reply_to_status_id, that.ol);
    while (in_reply_to.parents('.tweet')[0]) { in_reply_to = in_reply_to.parents('.tweet'); }
    return in_reply_to;
  }

  function add_thread_link(that, item) {
    var new_item = jQuery('.tweet-' + item.id, that.ol);
    var see_thread = jQuery('<a href="#" title="Pulls status #{title} into view" class="thread-link">see thread</a>'.supplant({
      title: item.in_reply_to_status_id
    }));
    see_thread.appendTo(new_item).click(function(event) {
      event.preventDefault();
      event.stopPropagation();
      var in_reply_to = get_in_reply_to(that, item);
      if (in_reply_to.length > 0) return attach_to_parent(that, item);
      var status_url = settings.urls.status_url.supplant({ status_id: item.in_reply_to_status_id });
      jQuery.getJSON(status_url, function(json) {
        console.log("individual tweet", json);
        that.render_tweet(0, json);
        see_thread.unbind().remove();
        attach_to_parent(that, item);
        new_item.removeClass('unread');
      });
    });
  }

  function attach_to_parent(that, item) {
    var new_item = jQuery('.tweet-' + item.id, that.ol);
    var in_reply_to = get_in_reply_to(that, item);
    if (in_reply_to.length > 0) {
      if ((that.read_id == item.in_reply_to_status_id) && in_reply_to.next()[0]) {
        var match = "" + in_reply_to.next()[0].className.match(/tweet-(\d+)/);
        that.mark_read(match[0]);
      }
      in_reply_to.insertBefore(new_item);
      in_reply_to.append(new_item);
    } else {
      add_thread_link(that, item);
    }
  }

  Box.add_after_hook(function(index, item) {
    var that = this;
    if (item.in_reply_to_status_id) setTimeout(function() { attach_to_parent(that, item); }, 500);
  });
})();
