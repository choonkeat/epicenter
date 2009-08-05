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
/* Install YIP http://www.yipyip.com/ to make use of this feature */
(function() {
  if (window.fluid) {
    Box.add_after_hook(function(index, tweet_json) {
      var that = this;
      if (that.first_load) return;
      window.fluid.showGrowlNotification({
        title: (tweet_json.user.name || tweet_json.user.screen_name),
        description: (tweet_json.text_plain || tweet_json.text),
        icon: (tweet_json.profile_image_url || tweet_json.user.profile_image_url),
        onclick: function() { that.read_button().click(); }
      });
    });
  }
})();
