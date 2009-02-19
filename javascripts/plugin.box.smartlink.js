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
 * Modifies tweet message to hyperlink @username
 * - to the specific status if possible
 * - otherwise to the user's profile
 */
Box.add_before_hook(function(index, tweet_json) {
  if (tweet_json.source) tweet_json.source = tweet_json.source.replace(/^<a /g, '<a target="_blank" ');
  tweet_json.text = tweet_json.text.
    replace(/((\w+:)\/\/(\S+)|\b((\w+\.|)\w+\.\w{2,4})\b)/g, '<a href="$2//$3$4" target="_blank">$1</a>').
    replace(/(@(\w+))/g, config.profile_link.supplant({ name: "$2"}));
  tweet_json.in_reply_to_screen_name = tweet_json.in_reply_to_screen_name || tweet_json.to_user;
  if (tweet_json.in_reply_to_screen_name) {
    // link to reply or profile, based on api data
    var replace_with = (tweet_json.in_reply_to_status_id ? config.status_link : config.profile_link).supplant({
      name:tweet_json.in_reply_to_screen_name,
      id: (tweet_json.in_reply_to_status_id || '')
    });
    var replyto_regexp = new RegExp('@' + tweet_json.in_reply_to_screen_name, 'gi')
    tweet_json.text = tweet_json.text.replace(replyto_regexp, replace_with);
  }
});
